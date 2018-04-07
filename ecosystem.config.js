// 



module.exports = {
	apps: [
		{
			name: 'robinhood.tools',
			// script: path.join(__dirname, 'main.js'),
			cwd: process.cwd(),
			script: 'dist/server/main.js',
			exec_mode: 'fork_mode',
			// exec_mode: 'cluster',
			// instances: 8,
			// watch: ['dist'],
			// autorestart: false,
			max_memory_restart: '512M',
			vizion: false,
			pmx: false,
			automation: false,
			// max_restarts: 3,
			// min_uptime: '3s',
			// wait_ready: true,
			// kill_timeout: 2000,
			// listen_timeout: 1000,
			args: [
				'--color',
				// '--inspect',
			],
			env: {
				'NODE_ENV': 'development'
			},
		}
	],
}


