// 



module.exports = {
	apps: [{
		name: 'robinhood.tools',
		script: 'dist/server/main.js',
		exec_mode: 'fork_mode',
		// exec_mode: 'cluster',
		// instances: 8,
		// watch: ['dist'],
		autorestart: false,
		max_memory_restart: '512M',
		vizion: false,
		pmx: false,
		automation: false,
		// max_restarts: 3,
		// min_uptime: '3s',
		args: ['--color'],
		env: {
			'NODE_ENV': 'development'
		},
	}],
}


