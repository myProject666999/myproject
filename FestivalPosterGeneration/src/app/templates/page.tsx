import { getAllTemplates, getFestivalsWithTemplates } from "@/lib/templates";
import TemplateCard from "@/components/TemplateCard";
import FestivalTabs from "@/components/FestivalTabs";

export const revalidate = 0;

export default async function TemplatesPage() {
  const festivalsWithTemplates = await getFestivalsWithTemplates();
  const allTemplates = await getAllTemplates();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">全部模板</h1>
        <p className="text-gray-500">共 {allTemplates.length} 个精美节日海报模板</p>
      </section>

      <FestivalTabs festivalsWithTemplates={festivalsWithTemplates} />

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">所有模板</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </section>
    </div>
  );
}
