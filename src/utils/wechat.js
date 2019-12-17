import COS from 'cos-js-sdk-v5' // 腾讯云cos上传sdk
import { common } from '../api/common'

const wechat = {
  // type 文件类型	number	1图片 2音频 3视频 4文档
  // folderName 分类文件夹	string	work:作业 notice:通知
  upload (fileList, type = 1, folderName = 'backstage') {
    return new Promise(async (resolve) => {
      // 初始化实例
      const cos = new COS({
        getAuthorization: async (options, callback) => {
          // 异步获取签名
          let res
          try {
            res = await common.qcloudAuth()
          } catch (err) {
            console.error('user3 error:', err)
          }
          if (res === undefined) {
            resolve('')
            return
          }
          const data = res.data.data
          callback({
            TmpSecretId: data.credentials && data.credentials.tmpSecretId,
            TmpSecretKey: data.credentials && data.credentials.tmpSecretKey,
            XCosSecurityToken: data.credentials && data.credentials.sessionToken,
            ExpiredTime: data.expiredTime
          })
        }
      })
      const uploadList = []
      fileList.map((item) => {
        uploadList.push(
          new Promise(async (resolveItem) => {
            const key = item
            const result = await common.qcloud({ fileKey: key.name, folderName: folderName, type: type })
            cos.putObject({
              Bucket: result.data.bucket,
              Region: result.data.region,
              Key: result.data.bucketKey,
              Body: item
            }, function (err, data) {
              resolveItem(data.Location)
            })
          })
        )
      })
      const results = await Promise.all(uploadList)
      resolve(results)
    })
  }
}

export default wechat
