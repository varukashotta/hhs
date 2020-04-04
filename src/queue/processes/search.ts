/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */

import createQueue from '../index';
import { logger } from '../../log/index';

const searchQueue = createQueue('search');


// const data = {
//   email: 'foo@bar.com',
// };

// const options = {
//   delay: 86400000,
//   attempts: 3,
// };


const processSearch = async (data:any, options = {}, callback: ((arg0: any) => any)) => {
  try {
    await searchQueue.add(data, options);
  } catch (e) {
    logger.error(e);
  }

  try {
    await searchQueue.process(async (job) => {
      await callback(job.data);
    });
  } catch (e) {
    logger.error(e);
  }
};

export default processSearch;
