<!-- src/components/Login.vue -->
<template>
  <div class="login-container">
    <h1>登录</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" />
      </div>
      <div class="form-group">
        <div class="choose-password" :class="{ action: showPassword }" @click="changePwd">password login</div>
        <div class="choose-password" :class="{ action: !showPassword }" @click="changeCode">Verification Code login</div>
      </div>
     
      <div class="form-group" v-if="!showPassword">
        <label for="verificationCode">Verification Code:</label>
        <div class="form-group">
          <input
            type="text"
            id="verificationCode"
            v-model="verificationCode"
            style="width: 50%"
          />
          <button
            style="padding: 0.5rem; font-size: 0.96rem"
            type="button"
            @click="sendVerificationCode"
            :disabled="sendingCode"
          >
            {{ sendingCode ? "Sending..." : "Send Verification Code" }}
          </button>
        </div>
      </div>
      <div class="form-group">
        <label for="password" v-if="showPassword">Password:</label>
        <label for="password" v-if="!showPassword">New Password:</label>
        <input type="password" id="password" v-model="password" />
        <!-- '您可以设置您的新密码;    默认不填,即不修改' -->
      </div>
      <div class="form-group" v-if="showPassword">
        <div class="forget-password">Forget password?</div>
      </div>
      
      <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script lang="ts">
// import { useRouter } from 'vue-router'
import { defineComponent, ref } from "vue";
// import { loginByCode, loginByPwd, sendEmailCode } from "@/api/db";

export default defineComponent({
  name: "Login",
  setup() {
    // const router = useRouter()
    const email = ref("");
    const password = ref("");
    const verificationCode = ref("");
    const sendingCode = ref(false);
    const showPassword = ref(true);
    const errorMessage = ref("");
    const changePwd= () =>{
        console.log("password");
        showPassword.value = true
    };
    const changeCode= () =>{
        showPassword.value = false
    };
    const handleSubmit = async () => {
      console.log("Email:", email.value);
      console.log("Password:", password.value);
      console.log("Verification Code:", verificationCode.value);

      // 在此处处理登录逻辑，例如调用 API 进行身份验证
      // 然后根据响应结果处理登录成功或失败的情况
      console.log("showPassword,",showPassword);
      // if (showPassword.value) {
      //   //密码登录
      //   try {
      //     const response = await loginByPwd({
      //       mailbox: email.value,
      //       password: password.value,
      //     });
      //     if (response.data.success) {
      //       console.log("登录成功!");
      //       // 登录成功
      //       // localStorage.setItem('token', response.data.token);
      //       // router.push('/dashboard');
      //     } else {
      //       console.log("登录失败!");
      //       // 登录失败
      //       // authError.value = response.data.message || 'Unknown error';
      //     }
      //   } catch (error) {
      //     console.log("处理请求失败的情况");
      //     // 处理请求失败的情况
      //     // authError.value = error.message || 'Unknown error';
      //   }
      // } else {
      //   console.log("验证码登录请求");
      //   //验证码登录
      //   try {
      //     const response = await loginByCode({
      //       mailbox: email.value,
      //       code: verificationCode.value,
      //     });
      //     console.log("response:", response);
      //     if (response && response.success) {
      //       console.log("Logged in successfully",response.data.id);
      //       router.push('/chat/'+response.data.id)
      //       // Redirect or perform other actions upon successful login
      //     } else {
      //       console.error("Login failed:", response);
      //       errorMessage.value = response.message;
      //     }
      //   } catch (error) {
      //     console.error("Error during form submission:", error);
      //   }
      // }
    };

    const sendVerificationCode = async () => {
      sendingCode.value = true;

      // 在此处处理发送验证码逻辑，例如调用 API 将验证码发送到邮箱
      // 在完成发送后，将 sendingCode 设置为 false
      // try {
      //   const response = await sendEmailCode({
      //     mailbox: email.value,
      //     code: verificationCode.value,
      //     password: password.value,
      //   });
      //   if (response && response.success) {
      //     console.log("Logged in successfully");
      //     router.push('/chat')
      //     // Redirect or perform other actions upon successful login
      //   } else {
      //     console.error("Login failed:", response);
      //   }
      // } catch (error) {
      //   console.error("Error during form submission:", error);
      // }

      setTimeout(() => {
        sendingCode.value = false;
      }, 1000);
    };

    return {
      email,
      password,
      verificationCode,
      sendingCode,
      showPassword,
      errorMessage,
      handleSubmit,
      changePwd,
      changeCode,
      sendVerificationCode,
    };
  },
});
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 400px;
  margin: 10% auto;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  border: 1px solid #ccc;
}

button {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  font-size: 1rem;
  margin-top: 1rem;
}

button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

button[type="submit"] {
  width: 100%;
}
.forget-password{
  display: inline-block;
  margin-top: 0.5rem;
  color: #007bff;
  text-decoration: none;
  cursor:pointer;
}
.choose-password {
  border: 1px solid #007bff;
  padding: 0.4rem 0.6rem;
  margin: 0px 1rem;
  display: inline-block;
  margin-top: 0.5rem;
  color: #007bff;
  text-decoration: none;
  cursor:pointer;
}
.action {
  background-color: #007bff;
  color: #fff;
}
.forgot-password:hover {
  text-decoration: underline;
}
.error-message {
  color: red;
  margin-bottom: 1rem;
}
</style>