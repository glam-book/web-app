import { useEffect } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { Effect as E, Schema } from 'effect';

import { useNavigate } from '@/router';
import * as services from '@/shrekServices';
import { tryDecodeInto } from '@/utils';

export default function Home() {
  const navigate = useNavigate();
  const { data: me } = services.me.useGet();

  useEffect(() => {
    E.try(() =>
      JSON.parse(atob(retrieveLaunchParams().tgWebAppData?.start_param ?? '')),
    ).pipe(
      tryDecodeInto(Schema.Struct({ calendarId: Schema.Number })),
      E.catchAll(() => E.succeed({ calendarId: me?.id })),
      E.andThen(({ calendarId }) => E.fromNullable(calendarId)),
      E.tap(calendarId =>
        navigate('/calendar/:id', { params: { id: String(calendarId) } }),
      ),
    );
  }, [me]);
}
