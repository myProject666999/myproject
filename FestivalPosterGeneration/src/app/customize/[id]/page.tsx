import { notFound } from "next/navigation";
import { getTemplateById, getFestivalById } from "@/lib/templates";
import PosterCustomizer from "@/components/PosterCustomizer";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

interface Props {
  params: { id: string };
}

export default async function CustomizePage({ params }: Props) {
  const templateId = parseInt(params.id);
  const template = await getTemplateById(templateId);

  if (!template) {
    notFound();
  }

  const festival = await getFestivalById(template.festival_id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          返回模板列表
        </a>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{template.name}</h1>
          {festival && (
            <span
              className="px-3 py-1 rounded-full text-sm text-white"
              style={{ backgroundColor: festival.color }}
            >
              {festival.icon} {festival.name}
            </span>
          )}
        </div>
        {template.description && (
          <p className="text-gray-500 mt-2">{template.description}</p>
        )}
      </div>

      <PosterCustomizer template={template} />
    </div>
  );
}
