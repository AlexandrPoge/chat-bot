import WidgetClient from "./widget-client";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function WidgetPage(props: PageProps<"/widget/[botId]">) {
  const { botId } = await props.params;
  const { source } = await props.searchParams;
  return <WidgetClient botId={botId} sourceId={typeof source === "string" ? source : undefined} />;
}
