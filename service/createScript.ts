/**
 * @fileoverview
 * @author  liuboyuan
 * @version 1.0.0
 * @created 2026/1/19
 */
import { requestInstance } from '@/service'

export async function createScript() {
  return await requestInstance.get('/agentOS/v1/slide-explain')
}
