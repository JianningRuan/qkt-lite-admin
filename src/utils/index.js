/**
 * Created by jiachenpan on 16/11/18.
 */

export function parseTime (time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function formatTime (time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

export function isExternal (path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function param2Obj (url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
}

export const common = {
  gradeList: [
    { value: 1, label: '一年级' },
    { value: 2, label: '二年级' },
    { value: 3, label: '三年级' },
    { value: 4, label: '四年级' },
    { value: 5, label: '五年级' },
    { value: 6, label: '六年级' },
    { value: 7, label: '七年级' },
    { value: 8, label: '八年级' },
    { value: 9, label: '九年级' }
  ],
  themeList: [
    { value: 'default', label: '默认主题' }
  ],
  /*
  * 判断传入的数字是否为手机号码
  * */
  isMobile (phone) {
    return (/^(?:13\d|14[5-9]|15\d|166|17\d|18\d|19[0|8|9]|106)-?\d{3,8}$/.test(phone))
  },
  /**
   * 该方法用于将有父子关系的数组转换成树形结构的数组
   * 接收一个具有父子关系的数组作为参数
   * 返回一个树形结构的数组
   */
  translateDataToTree (data) {
    // 没有父节点的数据
    const parents = data.filter(value => value.parentId === 0 || value.parentId === undefined || value.parentId === null)
    // 有父节点的数据
    const children = data.filter(value => value.parentId !== 0 || value.parentId !== undefined && value.parentId !== null)
    // 定义转换方法的具体实现
    const translator = (parents, children) => {
      // 遍历父节点数据
      parents.forEach((parent) => {
        // 遍历子节点数据
        children.forEach((current, index) => {
          // 此时找到父节点对应的一个子节点
          if (current.parentId === parent.id) {
            // 对子节点数据进行深复制，这里只支持部分类型的数据深复制，对深复制不了解的童靴可以先去了解下深复制
            const temp = JSON.parse(JSON.stringify(children))
            // 让当前子节点从temp中移除，temp作为新的子节点数据，这里是为了让递归时，子节点的遍历次数更少，如果父子关系的层级越多，越有利
            temp.splice(index, 1)
            // 让当前子节点作为唯一的父节点，去递归查找其对应的子节点
            translator([current], temp)
            // 把找到子节点放入父节点的children属性中
            typeof parent.children !== 'undefined' ? parent.children.push(current) : parent.children = [current]
          }
        }
        )
      }
      )
    }
    // 调用转换方法
    translator(parents, children)
    // 返回最终的结果
    return parents
  },
  translateAreaToTree (data) {
    const province = data.filter(value => value.areaType === 1)
    const city = data.filter(value => value.areaType === 2)
    const town = data.filter(value => value.areaType === 3)
    const noParentArr = []
    if (town.length > 0) {
      town.forEach((value) => {
        const parentId = value.parentId
        if (city.length > 0) {
          let hasParent = false
          city.forEach((current, index) => {
            if (current.id === parentId) {
              hasParent = true
              typeof current.children !== 'undefined' ? current.children.push(value) : current.children = [value]
            }
            if (!hasParent) {
              noParentArr.push(value)
            }
          })
        }
      })
    }
    if (city.length > 0) {
      city.forEach((value) => {
        const parentId = value.parentId
        if (province.length > 0) {
          let hasParent = false
          province.forEach((current, index) => {
            if (current.id === parentId) {
              hasParent = true
              typeof current.children !== 'undefined' ? current.children.push(value) : current.children = [value]
            }
            if (!hasParent) {
              noParentArr.push(value)
            }
          })
        }
      })
    }

    let lastArea
    if (province.length > 0) {
      lastArea = province.concat(noParentArr)
    } else if (city.length > 0) {
      lastArea = city.concat(noParentArr)
    } else {
      lastArea = town
    }
    return lastArea
  },
  // 校验密码：只能输入6-20个字母、数字、下划线
  isPasswd (s) {
    const part = /^(\w){6,20}$/
    if (!part.exec(s)) {
      return false
    } else {
      return true
    }
  },
  // 校验密码： 只能输入6个字母或数字
  isSixPassword (s) {
    const part = /^(\w){6}$/
    if (!part.exec(s)) {
      return false
    } else {
      return true
    }
  }
}
