/**
 * @fileoverview
 * @author  liuboyuan
 * @version 1.0.0
 * @created 2026/1/19
 */
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse} from 'axios'
import axios from 'axios'

// 定义统一的响应接口
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}



class CustomAxios {
  // axios 实例
  instance: AxiosInstance

  clearEmptyParam = (config: InternalAxiosRequestConfig<any>) => {
    const res_url: any[] = []
    if (config.url?.includes('?') && config.url.split('?')[1]) {
      const url_split = config.url.split('?')[1].split('&')
      url_split.forEach((key: any) => {
        if (!key.includes('undefined') && key.split('=')[1] && !key.includes('null')) {
          res_url.push(key)
        }
      })
      if (res_url) {
        config.url = `${config.url.split('?')[0]}?${res_url.join('&')}`
      }
    }
  }

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)
    // 拦截器
    this.instance.interceptors.request.use(
      (config) => {
        config.headers.Authorization = `Bearer ${localStorage.getItem('userToken')}`
        // config.headers.Cookie = 'ldap=eesyanuigbiaeasdaiiieasyiansgcoud6482e922ade8901993b613fff06dcaee3f74e25f529f0377f6b96d32344453e'
        if (config.method === 'get' || config.method === 'delete') {
          this.clearEmptyParam(config)
          config.params = {
            ...config.params,
            timestamp: new Date().valueOf() /* 解决GET请求缓存问题 */,
          }
        }

        return config
      },
      (err) => Promise.reject(err)
    )
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('接口返回response', response)

        const res = response.data

        // 统一响应格式
        const apiResponse: ApiResponse = {
          code: res.error_code || res.code || 0,
          message: res.msg || res.message || '操作成功',
          data: res.data || null
        };

        if (apiResponse && apiResponse.code !== 20000) {
          // 如果code不为20000，说明有错误
          console.error('接口返回错误', apiResponse)
          return Promise.reject(apiResponse);
        }

        return res


        // 保持原有的 AxiosResponse 结构，但使用统一的响应格式
        // return {
        //     ...response,
        //    data: apiResponse
        // };
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  request<T>(config: AxiosRequestConfig<T>): Promise<ApiResponse<T>> {
    return this.instance.request<any, ApiResponse<T>>(config)
  }
}

export const requestInstance = new CustomAxios({
  baseURL: '/proxyUrl',
  // baseURL: '',
  timeout: 120000,
  // withCredentials: true // 请求携带cookie
}).instance

