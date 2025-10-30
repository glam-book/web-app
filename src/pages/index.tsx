import { useEffect } from 'react';

import { useNavigate } from '@/router';
import * as services from '@/shrekServices';

export default function Home() {
  const navigate = useNavigate();
  const { data: me } = services.me.useGet();

  useEffect(() => {
    const calendarId = /*tgStartParams.calendarId ?? */ me?.id;

    if (calendarId) {
      navigate('/calendar/:id', { params: { id: String(calendarId) } });
    }
  }, [me]);
}
