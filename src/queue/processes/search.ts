/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */

import createQueue from '../index';
import { logger } from '../../log/index';



// const data = {
//   email: 'foo@bar.com',
// };

// const options = {
//   delay: 86400000,
//   attempts: 3,
// };


const processSearch = async (data:any, options = {}, callback: ((arg0: any) => any)) => {
  const searchQueue = createQueue('search');

  try {
    await searchQueue.add(data, options);
  } catch (e) {
    console.log(e);
  }

  try {
    await searchQueue.process(async (job, done) => {
      await callback(job.data);
      done();
    });
  } catch (e) {
    console.log(e);
  }

  searchQueue.close();
};

export default processSearch;
