import { Link } from 'react-router-dom';

import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="section-shell flex flex-col items-center py-24 text-center">
      <p className="text-6xl font-extrabold tracking-tight text-brand-200">404</p>
      <h1 className="mt-4 text-headline font-extrabold tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
        That page does not exist. Head back home, or start a new product analysis.
      </p>

      <div className="mt-8 flex gap-3">
        <Link to="/">
          <Button variant="secondary">Go home</Button>
        </Link>
        <Link to="/analyze">
          <Button>Analyze a product</Button>
        </Link>
      </div>
    </div>
  );
}
