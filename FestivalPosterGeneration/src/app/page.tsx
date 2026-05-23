import { getAllTemplates, getFestivalsWithTemplates } from "@/lib/templates";
import TemplateCard from "@/components/TemplateCard";
import FestivalTabs from "@/components/FestivalTabs";

export const revalidate = 0;

export default async function HomePage() {
  const festivalsWithTemplates = await getFestivalsWithTemplates();
  const allTemplates = await getAllTemplates();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-8">
        <div className="text-center mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            🎉 节日海报一键生成
          </h1>
          <p className="text-gray-600 text-lg">
            上传头像，定制文字，下载精美节日海报
          </p>
        </div>
      </section>

      <FestivalTabs festivalsWithTemplates={festivalsWithTemplates} />

      <section className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">全部模板</h2>
          <span className="text-gray-500 text-sm">共 {allTemplates.length} 个模板</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </section>
    </div>
  );
}
