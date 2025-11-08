import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportDashboardToPDF(mesReferencia: string | null) {
  try {
    // Selecionar o elemento do dashboard (excluindo header e sidebar)
    const dashboardElement = document.querySelector('main') as HTMLElement;
    
    if (!dashboardElement) {
      console.error('Dashboard element not found');
      return;
    }

    // Mostrar loading
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
          <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
          <p style="margin: 0; color: #333; font-size: 16px;">Gerando PDF...</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loadingDiv);

    // Salvar posição de scroll atual
    const originalScrollTop = dashboardElement.scrollTop;
    
    // Rolar para o topo
    dashboardElement.scrollTop = 0;

    // Aguardar um pouco para garantir que tudo foi renderizado
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capturar o dashboard como imagem (altura completa)
    const canvas = await html2canvas(dashboardElement, {
      scale: 2, // Melhor qualidade
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      height: dashboardElement.scrollHeight, // Capturar altura completa
      windowHeight: dashboardElement.scrollHeight // Altura da janela
    });

    // Restaurar posição de scroll
    dashboardElement.scrollTop = originalScrollTop;

    // Criar PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Adicionar título
    const titulo = mesReferencia 
      ? `Dashboard - ${mesReferencia}`
      : 'Dashboard - Todos os Meses';
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(titulo, 105, 15, { align: 'center' });
    
    // Adicionar data de geração
    const dataGeracao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Gerado em: ${dataGeracao}`, 105, 22, { align: 'center' });

    // Adicionar imagem do dashboard
    const imgData = canvas.toDataURL('image/png');
    
    let heightLeft = imgHeight;
    let position = 30; // Começar após o título

    // Adicionar primeira página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - position);

    // Adicionar páginas adicionais se necessário
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 30;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Gerar nome do arquivo
    const fileName = mesReferencia 
      ? `dashboard_${mesReferencia.replace(' - ', '_')}.pdf`
      : 'dashboard_todos.pdf';

    // Fazer download
    pdf.save(fileName);

    // Remover loading
    document.body.removeChild(loadingDiv);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF. Tente novamente.');
  }
}
