import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
}

export const Card = ({ title, children }: CardProps) => (
  <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
    <h3 className="p-4 border-b border-gray-200 text-lg font-semibold text-gray-800">{title}</h3>
    <div className="p-4">{children}</div>
  </section>
);
