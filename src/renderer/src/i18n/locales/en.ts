const en = {
  header: {
    title: 'WSL Manager',
    distroCount: '{{count}} distros',
    runningCount: '{{count}} running',
    stats: '{{total}} distros · {{running}} running',
    hiddenShown: 'Hidden shown',
    hiddenCount: '{{count}} hidden',
    import: 'Import',
    refresh: 'Refresh',
    settings: 'Settings'
  },
  distroList: {
    loading: 'Loading WSL distributions...',
    empty: 'No WSL distributions detected. Please install or import one first.'
  },
  distroCard: {
    default: 'Default',
    running: 'Running',
    stopped: 'Stopped',
    diskSize: 'Disk usage',
    createdAt: 'Created at',
    stop: 'Stop',
    start: 'Start',
    openTerminal: 'Open Terminal',
    openVSCode: 'Open in VSCode',
    openFiles: 'Open File Explorer',
    clone: 'Clone',
    export: 'Export',
    hide: 'Hide',
    unhide: 'Unhide',
    delete: 'Delete',
    deleteTitle: 'Delete Distribution',
    deleteConfirm: 'Are you sure you want to delete "{{name}}"? This action is irreversible!',
    deleteOk: 'Confirm Delete',
    cancel: 'Cancel',
    cloneSuccess: 'Cloned successfully',
    exportSuccess: 'Exported successfully',
    setVSCodePath: 'Set VSCode Path',
    vsCodePathTitle: 'VSCode Project Path',
    vsCodePathPlaceholder: 'e.g. /home/user/project',
    vsCodePathSaved: 'Path saved'
  },
  cloneDialog: {
    title: 'Clone "{{name}}"',
    nameLabel: 'New distribution name',
    namePlaceholder: 'e.g. Ubuntu-Clone',
    pathLabel: 'Install path',
    pathPlaceholder: 'Select install directory',
    ok: 'Clone',
    cancel: 'Cancel',
    nameRequired: 'Please enter a new distribution name',
    pathRequired: 'Please select an install path',
    cloning: 'Cloning in progress, please wait...'
  },
  importDialog: {
    title: 'Import WSL Distribution',
    nameLabel: 'Distribution name',
    namePlaceholder: 'e.g. MyUbuntu',
    pathLabel: 'Install path',
    pathPlaceholder: 'Select install directory',
    fileLabel: 'Import file (.tar / .tar.gz / .vhdx)',
    filePlaceholder: 'Select file',
    ok: 'Import',
    cancel: 'Cancel',
    nameRequired: 'Please enter a distribution name',
    pathRequired: 'Please select an install path',
    fileRequired: 'Please select an import file',
    importSuccess: 'Imported successfully'
  },
  messages: {
    listError: 'Failed to fetch distribution list',
    actionError: 'Operation failed',
    hidden: '"{{name}}" has been hidden',
    unhidden: '"{{name}}" has been unhidden'
  },
  settings: {
    title: 'Settings',
    generalSection: 'General',
    languageLabel: 'Language',
    pathSection: 'Paths',
    installRootLabel: 'Default install root path',
    installRootPlaceholder: 'e.g. C:\\WSL',
    ok: 'Save',
    cancel: 'Cancel',
    saveSuccess: 'Settings saved'
  },
  update: {
    newVersion: 'New Version Available',
    currentVersion: 'Current: v{{current}}',
    latestVersion: 'Latest: v{{latest}}',
    goDownload: 'Download',
    later: 'Later'
  }
}

export default en
