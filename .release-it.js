module.exports = {
  git: {
    commitMessage: 'chore(release): v${version}',
    requireUpstream: false,
    requireCleanWorkingDir: false,
  },
  github: {
    release: true,
  },
  npm: {
    publish: true,
  },
  plugins: {
    '@release-it/conventional-changelog': {
      preset: {
        name: 'conventionalcommits',
        types: [
          {
            type: 'feat',
            section: 'Features 🚀',
          },
          {
            type: 'feature',
            section: 'Features 🚀',
          },
          {
            type: 'fix',
            section: 'Bug Fixes 🐛',
          },
          {
            type: 'perf',
            section: 'Performance Improvements 🐳',
          },
          {
            type: 'revert',
            section: 'Reverts 💩',
          },
          {
            type: 'docs',
            section: 'Documentation 📝',
          },
          {
            type: 'style',
            section: 'Styles 💅🏻',
          },
          {
            type: 'chore',
            section: 'Miscellaneous Chores 🧰',
          },
          {
            type: 'refactor',
            section: 'Code Refactoring 🎨',
          },
          {
            type: 'test',
            section: 'Tests 🧪',
          },
          {
            type: 'build',
            section: 'Build System 🛠',
          },
          {
            type: 'ci',
            section: 'Continuous Integration 🤖',
          },
        ],
      },
      infile: 'CHANGELOG.md',
    },
  },
}
