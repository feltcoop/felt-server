import type {Task} from '@feltcoop/gro/dist/task/task.js';
import {spawnProcess} from '@feltcoop/gro/dist/utils/process.js';
import {DIST_DIR_NAME, paths} from '@feltcoop/gro/dist/paths.js';


export const task: Task = {
    description: 'deploy felt server to prod',
    run: async ({invokeTask}) => {        
        //TODO - add more dynamic naming
        await spawnProcess('tar',['-cvf','deploy.tar','dist']);        
        //scp to server
        //your ssh key will need to be added account
        await spawnProcess(
            `ssh root@96.126.116.174 && ` +
            `ls`,
            [],
            {shell: true},
        );
        //unpack        
        //start/restart server
	},    
}