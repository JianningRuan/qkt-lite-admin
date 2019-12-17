const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  account: state => state.user.account,
  mobile: state => state.user.mobile,
  name: state => state.user.name,
  roles: state => state.user.roles,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  permission_routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
  menuList: state => state.permission.menuList,
  menuId: state => state.permission.menuId
}
export default getters
