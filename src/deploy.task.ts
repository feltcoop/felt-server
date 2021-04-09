import type {Task} from '@feltcoop/gro/dist/task/task.js';
import {spawnProcess} from '@feltcoop/gro/dist/utils/process.js';
import {DIST_DIR_NAME, paths} from '@feltcoop/gro/dist/paths.js';


export const task: Task = {
    description: 'deploy felt server to prod',
    run: async ({invokeTask}) => {        
        //TODO - add more dynamic naming
        await spawnProcess('tar',['-cvf','deploy.tar','dist', 'package.json', 'package-lock.json']);        
        //scp to server
        //your ssh key will need to be added to linode account
        await spawnProcess('scp', ['deploy.tar', 'root@96.126.116.174:deploy.tar']);                                            
        //unpack        
        //// tar -xvf deploy.tar        
        //start/restart server
        //// npm i
        //// npm start
	},    
}


//Linode Ubuntu Initialization Steps
// sudo apt-get unzip
// curl -fsSL https://fnm.vercel.app/install | bash
// source /root/.bashrc
// fnm install 14.16.0
// sudo apt-get npm


