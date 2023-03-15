import { AuthoringData, loadAuthoringData} from 'xrauthor-loader'
import { createXRScene } from './init'

loadAuthoringData('assets/2001237_Zhuo Yijian').then((data: AuthoringData) => {
    createXRScene('renderCanvas', data);
});

//createXRScene('renderCanvas', 'hello from app');