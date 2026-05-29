import { get, post, put, del } from '@/utils/request'
import type {
  Container,
  ContainerQuery,
  ContainerCreate,
  ContainerUpdate,
  PageResult
} from '@/types'

export function getContainerList(params: ContainerQuery) {
  return get<PageResult<Container>>('/containers', { params })
}

export function getAllContainers() {
  return get<Container[]>('/containers/all')
}

export function getContainerById(id: number) {
  return get<Container>(`/containers/${id}`)
}

export function createContainer(data: ContainerCreate) {
  return post<Container>('/containers', data)
}

export function updateContainer(id: number, data: ContainerUpdate) {
  return put<Container>(`/containers/${id}`, data)
}

export function deleteContainer(id: number) {
  return del<void>(`/containers/${id}`)
}
