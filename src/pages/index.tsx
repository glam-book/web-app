import { useEffect } from 'react';

import { useNavigate } from '@/router';
import * as services from '@/shrekServices';

export default function Home() {
  const navigate = useNavigate();
  const { data: me } = services.me.useGet();

  useEffect(() => {
    if (me !== undefined) {
      navigate('/calendar/:id', { params: { id: `${me.id}` } });
    }
  }, [me]);
}
