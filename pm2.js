// 



module.exports = {
    apps: [{
            name: 'robinhood.tools',
            // cwd: process.cwd(),
            script: 'dist/server/main.js',
            exec_mode: 'fork_mode',
            restart_delay: 3000,
            // max_memory_restart: '512M',
            // vizion: false,
            // pmx: false,
            // automation: false,
            args: [
                '--color',
            ],
            env: {
                'NODE_ENV': 'development'
            },
        }],
};
