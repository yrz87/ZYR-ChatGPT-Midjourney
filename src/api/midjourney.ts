
import { post,get } from '@/utils/request/dbRequest'
import type {GenericAbortSignal } from 'axios'
import {useMidjourneyStore } from '@/store'
const midjourneyStore = useMidjourneyStore()
let API = import.meta.env.VITE_GLOB_API_MIDJOURNEY
export function mjSubmitImagine<T = any>(
    params: {
        prompt: string
        base64: string
        signal?: GenericAbortSignal
    },
) {
    try {
        if(midjourneyStore.drawModel == "NIJI"){
            API = import.meta.env.VITE_GLOB_API_MIDJOURNEY_NIJI
        }
        const response = post<T>({
            url: '/mj-submit-imagine',
            data: { prompt: params.prompt,base64:params.base64,API_MIDJOURNEY:API},
        })
        // console.log("mjSubmitImagine->response:", response); // 打印服务器返回的数据
        return response;
    } catch (error) {
        console.log("mjSubmitImagine->error,",error);
        return error;
    }
}

export function mjTaskQueue<T = any>() {
    try {
        if(midjourneyStore.drawModel == "NIJI"){
            API = import.meta.env.VITE_GLOB_API_MIDJOURNEY_NIJI
        }
        const response = post<T>({
            url: '/mj-task-queue',
        })
        return response;
    } catch (error) {
        return error;
    }
}

export function mjSubmitChange<T = any>(
    params: {
        taskId: string
        action: string
        index: number
        signal?: GenericAbortSignal
    },
) {
    try {
        if(midjourneyStore.drawModel == "NIJI"){
            API = import.meta.env.VITE_GLOB_API_MIDJOURNEY_NIJI
        }
        // console.log("mjSubmitChange==params:",params);
        const response = post<T>({
            url: '/mj-submit-change',
            data:  { taskId:params.taskId,action:params.action,index:params.index,API_MIDJOURNEY:API },
        })
        // console.log("mjSubmitChange->response:", response); // 打印服务器返回的数据
        return response;
    } catch (error) {
        // console.log("insertQuestion->error,",error);
        return error;
    }
}
export function mjTaskIdFetch<T = any>(
    params: {
        taskId: string
        model: string
        signal?: GenericAbortSignal
    },
) {
    try {
        if(params.model == "NIJI"){
            API = import.meta.env.VITE_GLOB_API_MIDJOURNEY_NIJI
        }
        // console.log(params, "==mjTaskIdFetch==params");
        const response = get<T>({
            url: '/mj-task-id-fetch?taskId='+params.taskId+"&API_MIDJOURNEY="+API,
            // data: { taskId: params.taskid},
        })
        // console.log("mjTaskIdFetch->response:", response); // 打印服务器返回的数据
        return response;
    } catch (error) {
        console.log("insertQuestion->error,",error);
        return error;
    }
}

export function mjSubmitDescribe<T = any>(
    params: {
        base64: string
        signal?: GenericAbortSignal
    },
) {
    try {
        if(midjourneyStore.drawModel == "NIJI"){
            API = import.meta.env.VITE_GLOB_API_MIDJOURNEY_NIJI
        }
        // console.log("mjSubmitImagine==params:",params);
        const response = post<T>({
            url: '/mj-submit-describe',
            data: {base64:params.base64,API_MIDJOURNEY:API},
        })
        // console.log("mjSubmitImagine->response:", response); // 打印服务器返回的数据
        return response;
    } catch (error) {
        // console.log("mjSubmitImagine->error,",error);
        return error;
    }
}


export function mjSubmitBlend<T = any>(
    params: {
        base64Array: string
        signal?: GenericAbortSignal
    },
) {
    try {
        if(midjourneyStore.drawModel == "NIJI"){
            API = import.meta.env.VITE_GLOB_API_MIDJOURNEY_NIJI
        }
        const response = post<T>({
            url: '/mj-submit-blend',
            data: { base64Array: params.base64Array,API_MIDJOURNEY:API},
        })
        return response;
    } catch (error) {
        return error;
    }
}
export function mjTaskList<T = any>() {
    try {
        if(midjourneyStore.drawModel == "NIJI"){
            API = import.meta.env.VITE_GLOB_API_MIDJOURNEY_NIJI
        }
        const response = get<T>({
            url: '/mj-task-list?API_MIDJOURNEY='+API
        })
        return response;
    } catch (error) {
        return error;
    }
}
export function mjTaskListByCondition<T = any>(
    params: {
        ids: string
    },
) {
    try {
        console.log(params.ids);
        if(midjourneyStore.drawModel == "NIJI"){
            API = import.meta.env.VITE_GLOB_API_MIDJOURNEY_NIJI
        }
        const response = post<T>({
            url: '/mj-task-list-by-condition',
            data: { API_MIDJOURNEY:API,ids:params.ids},
        })
        return response;
    } catch (error) {
        return error;
    }
}

export function useGetMidjourneySelfProxyUrl<T = any>(
    params: {
        url: string
    },
) {
    
    try {
        // console.log(params, "==mjTaskIdFetch==params");
        const response = get<T>({
            url: '/proxy?url='+params.url,
            // data: { taskId: params.taskid},
        })
        console.log("download->response:", response); // 打印服务器返回的数据
        return response;
    } catch (error) {
        // console.log("insertQuestion->error,",error);
        return error;
    }
}