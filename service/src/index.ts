import express from 'express'
import type { RequestProps } from './types'
import { generationsImage } from './daller2'
import { getConnection } from './utils/dbconfig'
import axios from 'axios'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import {createProxyMiddleware} from 'http-proxy-middleware';
import {bodyParser} from 'body-parser';

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})
// 增加出现错误，回滚操作
// 你会看到两个重要的事务处理步骤：
// connection.commit() - 这是在执行所有数据库操作后，如果没有错误发生，我们就提交事务。这将保存所有的更改。
// connection.rollback() - 这是当出现错误时执行的。它会撤销在事务中进行的所有更改。这就是所谓的"回滚"。
// 在 try 语句块中，所有的数据库操作都是事务的一部分。如果这些操作中的任何一个失败，我们都会进入 catch 语句块并回滚事务。只有当所有操作都成功时，我们才提交事务。
// 在 finally 语句块中，我们调用 connection.release() 来确保在结束后，无论事务是否成功，连接都会被正确地返回到连接池。
// 注意：不同的数据库和数据库驱动可能有不同的方式来处理事务。这是使用 MySQL 和 Node.js 的一种常见方式。如果你使用的是其他数据库或驱动，应查阅相关文档以找到正确的方法。
const updateNumByTokenFunction = async (objReuqest, retryCount = 0) => {
  const maxRetry = 3; // maximum number of retries
  const { question,token,type,userIdentify,version } = objReuqest;
  console.log("根据token,修改剩余次数",token);
  let obj = {};
  let lessNum = 1;
  const connection = await getConnection();
  // Start transaction
  await connection.beginTransaction();
  try {
    const [rows, fields] = await connection.execute(
      'SELECT id,surplus,use_num,express_date,type,vip_chatgpt4_num FROM chatgpt_user WHERE token = ? and type=?',
      [token,userIdentify]
    );

    
    if(rows.length > 0) {
      const row = rows[0];
      if(userIdentify === 1) {
        const expressDate = new Date(row.express_date);
        const today = new Date();
        if(expressDate.getTime() < today.getTime()) {
          obj = { success: false, message: '您的密钥已过期!' };
        } else {
          if(version === 'gpt-4') {
            await connection.execute(
              'UPDATE chatgpt_user SET vip_chatgpt4_num = vip_chatgpt4_num - 1 WHERE token = ? AND vip_chatgpt4_num > 0',
              [token]
            );
          }
          obj = { success: true, message: 'Logged in successfully',data:row };
        }
      } else {//积分
        if(version === 'gpt-4') {
          const [rows2] = await connection.execute(
            'SELECT value FROM sys_config WHERE name = "LESS_NUM_BY_CHATGPT4" '
          );
          lessNum = Number(rows2[0].value);
        }
        const newUseNum = row.use_num + lessNum;
        const newSurplus = row.surplus - lessNum;
        const [result] = await connection.execute(
          'UPDATE chatgpt_user SET surplus = ?, use_num = ? WHERE token = ? AND surplus > 0',
          [newSurplus, newUseNum, token]
        );
        if(result.affectedRows > 0) {
          obj = { success: true, message: 'Logged in successfully', data:{"useNum":newUseNum,"surplus":newSurplus}};
        } else {
          obj = { success: false, message: '请输入正确的密钥!' };
        }
      }
    } else {
      obj = { success: false, message: '请输入正确的密钥!' };
    }

    if(type == 0) {
      await connection.execute(
        'INSERT INTO chatgpt_question_log(message, token,type,num,version) VALUES (?,?,?,?,?)',
        [question,token,type,lessNum,version]
      );
    } else if(type == 1) {
      await connection.execute(
        'UPDATE chatgpt_question_log SET type = ? WHERE token = ? ORDER BY id DESC LIMIT 1',
        [type,token]
      );
    }

    // If there's no error, commit the transaction
    await connection.commit();
    connection.release();
    return obj;
  } catch (err) {
    await connection.rollback(); // rollback the transaction

    // retry logic
    if (retryCount < maxRetry) {
      console.log(`Retry attempt ${retryCount + 1}...`);
      return await updateNumByTokenFunction(objReuqest, retryCount + 1); // retry the function with incremented retryCount
    } else {
      console.log('Max retries exceeded.');
      // throw err; // throw the error if max retries exceeded
      obj = { success: false, message: 'Max retries exceeded.' };
      return obj;
    }
  } finally {
    connection.release();
  }
}

const processData = async (row: any, token: string, connection: any) => {
  if(row.type == 0) {
    return { userIdentify:row.type, surplus: row.surplus, use_num: row.use_num };
  }

  const expressDate = new Date(row.express_date);
  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() + 1);

  if(row.start_date == null) { 
    await connection.execute(
      "UPDATE chatgpt_user SET start_date = CONVERT_TZ(NOW(), 'UTC', 'Asia/Shanghai'), express_date = DATE_ADD(start_date, INTERVAL long_date MONTH) WHERE token = ? AND type = ?",
      [token, row.type]
    );
    const [updatedRows] = await connection.execute(
      'SELECT start_date,express_date FROM chatgpt_user WHERE token = ?',
      [token]
    );
    return { userIdentify:row.type, startDate: updatedRows[0].start_date, expressDate: updatedRows[0].express_date, vipChatgpt4Num: row.vip_chatgpt4_num };
  }
  else if(row.long_date == 0 || expressDate.getTime() >= today.getTime()) {
    return { userIdentify:row.type, startDate: row.start_date, expressDate: row.long_date == 0 ? 0 : row.express_date, vipChatgpt4Num: row.vip_chatgpt4_num };
  }
  else {
    throw new Error('您的密钥已过期!');
  }
}
router.post('/updateNumByToken', async (req, res) => {
  const { token,userIdentify,chatModel,question,type} = req.body;
  const obj = {userIdentify:userIdentify,token:token,version:chatModel,question:question,type:type}
  await updateNumByTokenFunction(obj)
});
router.post('/verificationCode', async (req, res) => {
  const { token } = req.body;
  const connection = await getConnection()

  try {
    const [rows] = await connection.execute(
      'SELECT surplus,use_num,type,start_date,long_date,express_date,vip_chatgpt4_num FROM chatgpt_user WHERE token = ?',
      [token]
    );

    if (rows.length > 0) {
      const data = await processData(rows[0], token, connection);
      res.status(200).json({ success: true, message: 'Logged in successfully', data });
    } else {
      res.status(200).json({ success: false, message: '请输入正确的密钥!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
});


router.post('/mj-submit-imagine', async (req, res) => {
  try {
    const { API_MIDJOURNEY,prompt,base64 } = req.body; 
    // console.log("/mj-submit-imagine",VITE_GLOB_API_MIDJOURNEY+"/mj/submit/imagine",prompt);
    const response = await axios.post(API_MIDJOURNEY+"/mj/submit/imagine", { "prompt":prompt,"base64":base64 });
    // console.log("response:mj-submit-imagine");
    // res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
    // let data = response.data;
    // res.status(200).json({ success: true, message: 'successfully',data});
  } catch (error) {
    res.send(error)
  }
});


router.get('/mj-task-id-fetch', async (req, res) => {
  const taskId = req.query.taskId;
  const API_MIDJOURNEY = req.query.API_MIDJOURNEY;
  // console.log(VITE_GLOB_API_MIDJOURNEY+"/mj/task/"+taskId+"/fetch",taskId);
  try {
    const response = await axios.get(API_MIDJOURNEY+"/mj/task/"+taskId+"/fetch");
    // console.log("response:===");
    // res.set('Content-Type', response.headers['content-type']);
    // let data = response.data;
    // res.status(200).json({ success: true, message: 'successfully',data});
    res.send(response.data)
  } catch (error) {
    res.send(error)
  }
});

router.post('/mj-submit-change', async (req, res) => {
  try {
    const { API_MIDJOURNEY,taskId, action, index} = req.body; 
    // console.log("/mj-submit-change",VITE_GLOB_API_MIDJOURNEY+"/mj/submit/change");
    const response = await axios.post(API_MIDJOURNEY+"/mj/submit/change", { "taskId":taskId,"action":action,"index":index });
    // console.log(response);
    // res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  //   let data = response.data;
  //   res.status(200).json({ success: true, message: 'successfully',data});
  } catch (error) {
    res.send(error)
  }
});
router.post('/mj-submit-describe', async (req, res) => {
  try {
    const {API_MIDJOURNEY,base64} = req.body; 
    // console.log("/mj-submit-describe",VITE_GLOB_API_MIDJOURNEY+"/mj/submit/describe");
    const response = await axios.post(API_MIDJOURNEY+"/mj/submit/describe", { "base64":base64});
    // console.log(response);
    res.send(response.data);
  //   let data = response.data;
  //   res.status(200).json({ success: true, message: 'successfully',data});
  } catch (error) {
    res.send(error)
  }
});

router.post('/mj-submit-blend', async (req, res) => {
  try {
    const {API_MIDJOURNEY,base64Array} = req.body; 
    console.log("/mj-submit-blend",API_MIDJOURNEY+"/mj/submit/blend","base64Array:",base64Array);
    const response = await axios.post(API_MIDJOURNEY+"/mj/submit/blend", { "base64Array":base64Array});
    // console.log(response);
    res.send(response.data);
  //   let data = response.data;
  //   res.status(200).json({ success: true, message: 'successfully',data});
  } catch (error) {
    res.send(error)
  }
});
router.post('/mj-task-queue', async (req, res) => {
  const API_MIDJOURNEY = req.query.API_MIDJOURNEY;
  try {
    // console.log("/mj-submit-queue",API_MIDJOURNEY+"/mj/task/queue");
    const response = await axios.post(API_MIDJOURNEY+"/mj/task/queue");
    // console.log(response);
    res.send(response.data);
  //   let data = response.data;
  //   res.status(200).json({ success: true, message: 'successfully',data});
  } catch (error) {
    res.send(error)
  }
});
router.get('/mj-task-list', async (req, res) => {
  const API_MIDJOURNEY = req.query.API_MIDJOURNEY;
  try {
    // console.log("/mj-submit-list",API_MIDJOURNEY+"/mj/task/list");
    const response = await axios.get(API_MIDJOURNEY+"/mj/task/list");
    // console.log(response);
    res.send(response.data);
  //   let data = response.data;
  //   res.status(200).json({ success: true, message: 'successfully',data});
  } catch (error) {
    res.send(error)
  }
});
router.post('/mj-task-list-by-condition', async (req, res) => {
  const {API_MIDJOURNEY,ids} = req.body; 
  let arr = ids.split(",");
  try {
    console.log("/mj-submit-list-by-condition",API_MIDJOURNEY+"/mj/task/list",arr);
    const response = await axios.post(API_MIDJOURNEY+"/mj/task/list-by-condition",{"ids":arr});
    // console.log(response);
    res.send(response);
  //   let data = response.data;
  //   res.status(200).json({ success: true, message: 'successfully',data});
  } catch (error) {
    res.send(error)
  }
});
router.post('/generate-image', async (req, res) => {
  const { prompt,userIdentify,token } = req.body;
  // const obj = {userIdentify:userIdentify,token:token,version:"Daller2",question:prompt,type:0}
  // await updateNumByTokenFunction(obj)
 try {
   let response = await generationsImage({
     prompt: prompt
   })
   res.status(200).json({ success: true, message: 'successfully',data:response.data });
 } catch (error) {
  // const obj = {userIdentify:userIdentify,token:token,version:"Daller2",question:prompt,type:1}
  // await updateNumByTokenFunction(obj)
  res.status(500).send('Error: ' + error.message);
 }finally {
   res.end()
 }
});

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')
  const { prompt, options = {}, systemMessage, temperature, top_p, chatModel,userIdentify,token } = req.body as RequestProps
  //updateToken 修改的次数
  // const obj = {userIdentify:userIdentify,token:token,version:chatModel,question:prompt,type:0}
  // await updateNumByTokenFunction(obj)
  try {
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
      chatModel
    })
  }
  catch (error) {
    //错误updateToken 返回修改的次数
    // const obj = {userIdentify:userIdentify,token:token,version:chatModel,question:prompt,type:1}
    // await updateNumByTokenFunction(obj)
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})
app.use('/images/cnd-discordapp', createProxyMiddleware({ 
  target: 'https://cdn.discordapp.com/attachments', // 这是实际的图片服务器地址
  changeOrigin: true, 
  pathRewrite: {
    '^/images/cnd-discordapp' : '/' // 这将会将你的服务器上的 /images 路径重写为目标服务器上的 / 路径
  },
  onProxyReq: function(proxyReq, req, res) {
    console.log('Original Request URL: ', req.originalUrl);
    console.log('Proxy Request URL: ', proxyReq.path);
  },
  onProxyRes: function(proxyRes, req, res) {
    console.log('Proxy Response Status: ', proxyRes.statusCode);
  },
  onError: function(err, req, res) {
    console.error('Error in proxy: ', err);
  }
}));

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)
// app.use(bodyParser.json()); // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use(bodyParser.json({ limit: '100mb' }));
// app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
