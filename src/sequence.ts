import {MiddlewareSequence, RequestContext} from '@loopback/rest';
import {performance} from 'perf_hooks';
import get from 'lodash/get';

export class MySequence extends MiddlewareSequence {
  log(msg: any) {
    console.log(msg);
  }
  async handle(context: RequestContext) {
    const {request} = context;
    const pathname = get(request, '_parsedUrl.pathname') || '';
    let finalpath = '';
    performance.mark(`start-find ${pathname}`);

    try {
      const tokens = pathname.split('/');
      tokens.forEach((t: string) => {
        if (!/\d/.test(t)) {
          finalpath += `${t}/`;
        }
      });

      await super.handle(context);
    } catch (e) {
      this.log(e);
    } finally {
      performance.mark(`end-find ${pathname}`);
      performance.measure(
        `${finalpath}`,
        `start-find ${pathname}`,
        `end-find ${pathname}`,
      );
    }
  }
}
