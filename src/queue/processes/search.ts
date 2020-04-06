/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */

import createQueue from '../index';
import { logger } from '../../log/index';
import _ from 'lodash';



// const data = {
//   email: 'foo@bar.com',
// };

// const options = {
//   delay: 86400000,
//   attempts: 3,
// };




const processSearch = async (data:any, options = {}, callback: ((arg0: any, arg1: any) => any)) => {
  const searchQueue = createQueue('search');

  var after100 = _.after(100, function() {
    searchQueue.close().then(function() {
      console.log('done');
    });
  });

  try {
    await searchQueue.add(data, options);
  } catch (e) {
    console.log(e);
  }

  try {
    await searchQueue.process(async (job, done) => {
     let you =  await callback(job.data, job);



      searchQueue.close();

      // return you;


      // let test = await job.isCompleted();

      // console.log(test);
      // searchQueue.on('completed', after100);
      // searchQueue.clean(15000);

      // searchQueue.on('progress', after100)

      done(null, "test");


    });
  } catch (e) {
    return e;
  }



  searchQueue.on('completed',  () => console.log('done'));
};

export default processSearch;
