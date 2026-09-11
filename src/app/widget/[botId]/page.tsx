import WidgetClient from "./widget-client";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  return <WidgetClient botId={botId} />;
}
