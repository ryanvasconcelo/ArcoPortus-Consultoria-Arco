import ArcoPortusHeader from "@/components/Header";
import ArcoPortusFooter from "@/components/Footer";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ArcoPortusHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-secondary text-white text-center py-4 rounded-t-lg mb-6">
          <h1 className="text-xl font-bold">DASHBOARDS - POWER BI</h1>
        </div>

        {/* Power BI Iframe */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-[800px] w-full">
            <iframe
              src="https://app.powerbi.com/view?r=eyJrIjoiYTZiZjU4YzAtNzk4Zi00NTY4LWI0MzAtNzE4OGM5OTM5ZGM3IiwidCI6IjQwZDZmOWI4LTVjYzUtNDdhOS1hMDY4LWQ4N2E3YjRiZGQ3NyJ9"
              className="w-full h-full border-0"
              allowFullScreen
              title="Power BI Dashboard"
            ></iframe>
          </div>
        </div>

        {/* Fallback message if iframe doesn't load */}
        <div className="bg-muted/20 rounded-lg p-8 text-center mt-6">
          <h3 className="text-lg font-semibold mb-2">Dashboard em Desenvolvimento</h3>
          <p className="text-muted-foreground">
            Os relatórios do Power BI serão carregados aqui.
            Entre em contato com o administrador para configurar o acesso aos dashboards.
          </p>
        </div>
      </main>

      <ArcoPortusFooter />
    </div>
  );
};

export default Dashboard;