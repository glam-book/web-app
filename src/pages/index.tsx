import { useEffect } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { Effect as E, Schema, Console, pipe } from 'effect';

import { useNavigate } from '@/router';
import * as services from '@/shrekServices';
import { tryDecodeInto } from '@/utils';

export default function Home() {
  const navigate = useNavigate();
  const me = services.me.useGet();

  useEffect(() => {
    console.debug('meIsLoading:', me.isLoading);
    if (me.isLoading) return;

    pipe(
      E.try(() =>
        JSON.parse(
          atob(retrieveLaunchParams().tgWebAppData?.start_param ?? ''),
        ),
      ),
      tryDecodeInto(Schema.Struct({ calendarId: Schema.String })),
      E.catchAll(error => {
        console.debug(error);
        return E.succeed({ calendarId: me.data?.id });
      }),
      E.andThen(x => E.fromNullable(x.calendarId)),
      E.tap(calendarId => {
        console.debug({ calendarId });
        navigate('/calendar/:id', { params: { id: String(calendarId) } });
      }),
      E.runSyncExit,
    );
  }, [me.data, me.isLoading]);
}
