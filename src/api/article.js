import request from '@/utils/request'

export function fetchListByPage(query) {
  return request({
    url: '/api/article/pageList',
    method: 'get',
    params: query
  })
}

export function publishArticle(data) {
  return request({
    url: '/api/article/publishArticle',
    method: 'POST',
    data
  })
}

export function createArticleDraft(data) {
  return request({
    url: '/api/article/createArticleDraft',
    method: 'post',
    data
  })
}

export function modifyTitle(data) {
  return request({
    url: '/api/article/modifyTitle',
    method: 'post',
    data
  })
}
