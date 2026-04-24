const zh = {
  header: {
    title: 'WSL Manager',
    distroCount: '{{count}} 个发行版',
    runningCount: '{{count}} 个运行中',
    stats: '{{total}} 个发行版 · {{running}} 个运行中',
    hiddenShown: '隐藏已显示',
    hiddenCount: '{{count}} 个已隐藏',
    import: '导入',
    refresh: '刷新'
  },
  distroList: {
    loading: '正在加载 WSL 发行版...',
    empty: '未检测到 WSL 发行版，请先安装或导入'
  },
  distroCard: {
    default: '默认',
    running: '运行中',
    stopped: '已停止',
    diskSize: '磁盘占用',
    createdAt: '创建时间',
    stop: '停止',
    start: '启动',
    openTerminal: '打开终端',
    openVSCode: '在 VSCode 中打开',
    openFiles: '打开文件目录',
    clone: '克隆',
    export: '导出',
    hide: '隐藏',
    unhide: '取消隐藏',
    delete: '删除',
    deleteTitle: '删除发行版',
    deleteConfirm: '确定要删除 "{{name}}" 吗？此操作不可逆！',
    deleteOk: '确认删除',
    cancel: '取消',
    cloneSuccess: '克隆成功',
    exportSuccess: '导出成功'
  },
  cloneDialog: {
    title: '克隆 "{{name}}"',
    nameLabel: '新发行版名称',
    namePlaceholder: '例如: Ubuntu-Clone',
    pathLabel: '安装路径',
    pathPlaceholder: '选择安装目录',
    ok: '克隆',
    cancel: '取消',
    nameRequired: '请输入新发行版名称',
    pathRequired: '请选择安装路径'
  },
  importDialog: {
    title: '导入 WSL 发行版',
    nameLabel: '发行版名称',
    namePlaceholder: '例如: MyUbuntu',
    pathLabel: '安装路径',
    pathPlaceholder: '选择安装目录',
    fileLabel: '导入文件 (.tar / .tar.gz / .vhdx)',
    filePlaceholder: '选择文件',
    ok: '导入',
    cancel: '取消',
    nameRequired: '请输入发行版名称',
    pathRequired: '请选择安装路径',
    fileRequired: '请选择导入文件',
    importSuccess: '导入成功'
  },
  messages: {
    listError: '获取发行版列表失败',
    actionError: '操作失败',
    hidden: '已隐藏 "{{name}}"',
    unhidden: '已取消隐藏 "{{name}}"'
  }
}

export default zh
