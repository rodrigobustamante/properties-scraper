import crawler from '../services/crawler';

const findElementByClass = async (uri: string, cssClass: string) => {
  const elements = await (new Promise((resolve, reject) => {
    crawler.queue({
      uri,
      callback: (error: any, res: any, done: Function) => {
        if (error) {
          reject(error);

          throw new Error(error);
        }

        const { $ } = res;
        const el = $(cssClass);

        resolve(el);
        done();
      }
    });
  }).then(data => data));

  return elements;
};

export default findElementByClass;
