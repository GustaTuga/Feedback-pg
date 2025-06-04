  const registros = [];
  let registrosVisible = false;
  
  // Referência para o jsPDF
  const { jsPDF } = window.jspdf;

  function calcularMedia(...notas) {
    const soma = notas.reduce((a, b) => a + b, 0);
    return (soma / notas.length).toFixed(2);
  }

  function getNotaClass(nota) {
    if (nota < 7) return 'nota-baixa';
    if (nota >= 7 && nota <= 8) return 'nota-media';
    return 'nota-alta';
  }

  function getExcelClass(nota) {
    if (nota < 7) return 'excel-vermelho';
    if (nota >= 7 && nota <= 8) return 'excel-amarelo';
    return 'excel-verde';
  }

  function toggleRegistrosVisibility() {
    const registrosContent = document.getElementById('registrosContent');
    const toggleButton = document.getElementById('toggleVisibility');
    
    registrosVisible = !registrosVisible;
    
    if (registrosVisible) {
      registrosContent.style.display = 'block';
      toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
    } else {
      registrosContent.style.display = 'none';
      toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
    }
  }

  function finalizarFeedback() {
    // Validar o formulário
    const form = document.getElementById('feedbackForm');
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = 'red';
        isValid = false;
      } else {
        input.style.borderColor = '';
      }
    });
    
    if (!isValid) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const nome = document.getElementById("nome").value;
    const cargo = document.getElementById("cargo").value;
    const matricula = document.getElementById("matricula").value;
    
    // Formatar a data para dd/mm/aaaa
    const dataInput = document.getElementById("data").value; // formato yyyy-mm-dd
    const dataObj = new Date(dataInput);
    const dia = dataObj.getDate().toString().padStart(2, '0');
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear();
    const dataFormatada = `${dia}/${mes}/${ano}`;

    const atendimento = Number(document.getElementById("atendimento").value);
    const vendasMP = Number(document.getElementById("vendasMP").value);
    const vendasGN = Number(document.getElementById("vendasGN").value);
    const faturamento = Number(document.getElementById("faturamento").value);
    const relacionamento = Number(document.getElementById("relacionamento").value);
    const etica = Number(document.getElementById("etica").value);
    const pontualidade = Number(document.getElementById("pontualidade").value);
    const iniciativa = Number(document.getElementById("iniciativa").value);
    const organizacao = Number(document.getElementById("organizacao").value);
    const precificacao = Number(document.getElementById("precificacao").value);
    const reposicao = Number(document.getElementById("reposicao").value);
    const sinalizacao = Number(document.getElementById("sinalizacao").value);
    const proatividade = Number(document.getElementById("proatividade").value);
    
    // Obter pontos fortes e de melhoria
    const pontosFortes = document.getElementById("pontosFortes").value;
    const pontosMelhoria = document.getElementById("pontosMelhoria").value;

    const media = calcularMedia(atendimento, vendasMP, vendasGN, faturamento, relacionamento, etica, pontualidade, iniciativa, organizacao, precificacao, reposicao, sinalizacao, proatividade);

    // Adiciona todos os dados, incluindo pontos fortes e de melhoria
    registros.push([
      nome, cargo, matricula, dataFormatada, atendimento, vendasMP, vendasGN,
      faturamento, relacionamento, etica, pontualidade, iniciativa, organizacao, 
      precificacao, reposicao, sinalizacao, proatividade, media,
      pontosFortes, pontosMelhoria
    ]);

    atualizarTabelaRegistros();
    atualizarTabelaExportacao();
    
    // Gerar o PDF automaticamente
    gerarPDF(nome, cargo, matricula, dataFormatada, atendimento, vendasMP, vendasGN,
      faturamento, relacionamento, etica, pontualidade, iniciativa, organizacao,
      precificacao, reposicao, sinalizacao, proatividade, media,
      pontosFortes, pontosMelhoria);
    
    document.getElementById("feedbackForm").reset();
    alert("Feedback enviado com sucesso! O PDF foi gerado automaticamente.");
  }

  function atualizarTabelaRegistros() {
    const container = document.getElementById('registrosContainer');
    const tbody = document.getElementById('registrosBody');
    const countElement = document.getElementById('registrosCount');
    
    if (registros.length > 0) {
      container.style.display = 'block';
      countElement.textContent = `Total: ${registros.length}`;
      
      tbody.innerHTML = '';
      registros.forEach(registro => {
        const tr = document.createElement('tr');
        
        // Nome, Cargo, Matrícula, Data
        for (let i = 0; i < 4; i++) {
          const td = document.createElement('td');
          td.textContent = registro[i];
          tr.appendChild(td);
        }
        
        // Média
        const tdMedia = document.createElement('td');
        tdMedia.textContent = registro[17];
        tdMedia.className = getNotaClass(parseFloat(registro[17]));
        tr.appendChild(tdMedia);
        
        tbody.appendChild(tr);
      });
    } else {
      container.style.display = 'none';
    }
  }

  function atualizarTabelaExportacao() {
    const tbody = document.getElementById('tabelaExportacaoBody');
    tbody.innerHTML = '';
    
    registros.forEach(registro => {
      const tr = document.createElement('tr');
      
      // Adiciona todas as colunas (exceto pontos fortes e de melhoria)
      for (let i = 0; i < 18; i++) {
        const td = document.createElement('td');
        td.textContent = registro[i];
        td.style.border = '1px solid #000000';
        td.style.textAlign = 'center';
        
        // Aplica cores condicionais para as colunas de notas (índices 4 a 12)
        if (i >= 4 && i <= 17) {
          const nota = parseFloat(registro[i]);
          if (!isNaN(nota)) {
            td.className = getExcelClass(nota);
          }
        }
        
        tr.appendChild(td);
      }
      
      tbody.appendChild(tr);
    });
  }

  function exportarExcel() {
    if (registros.length === 0) {
      alert("Não há dados para exportar!");
      return;
    }

    // Usando a biblioteca XLSX para uma exportação mais segura
    const headers = [
      "Nome", "Cargo", "Matrícula", "Data", "Atendimento", "Vendas MP", "Vendas GN/S",
      "Faturação", "Relacionamento", "Ética", "Pontual", "Iniciativa", "Organização", 
      "Precificação", "Reposição", "Sinalização", "Proatividade", "Média"
    ];

    // Cria uma cópia dos registros sem os pontos fortes e de melhoria
    const registrosExcel = registros.map(registro => registro.slice(0, 18));
    
    const ws_data = [headers, ...registrosExcel];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Ajusta largura das colunas baseado no conteúdo
    const wscols = headers.map((header, colIndex) => {
      let max_length = header.length;
      for(let i=0; i<registrosExcel.length; i++) {
        const cell_value = registrosExcel[i][colIndex];
        if(cell_value !== undefined && cell_value !== null) {
          max_length = Math.max(max_length, cell_value.toString().length);
        }
      }
      return { wch: max_length + 0 };
    });
    ws['!cols'] = wscols;

    // Aplica cores condicionais para as colunas de notas (E até M: índices 4 a 12)
    for (let row = 1; row <= registrosExcel.length; row++) {
      for (let col = 4; col <= 12; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const valor = Number(registrosExcel[row - 1][col]);
        
        if (!isNaN(valor)) {
          let color = "FFFFFF";
          
          if (valor < 7) {
            color = "FF9999";
          } else if (valor >= 7 && valor <= 8) {
            color = "FFFF99";
          } else if (valor >= 9) {
            color = "CCFFCC";
          }
          
          if (!ws[cellAddress].s) ws[cellAddress].s = {};
          ws[cellAddress].s = { fill: { fgColor: { rgb: color } } };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio Feedback");

    XLSX.writeFile(wb, "feedback_pague_menos.xlsx");
  }
  
  // FUNÇÃO CORRIGIDA - gerarPDF com posicionamento dinâmico
  function gerarPDF(nome, cargo, matricula, data, atendimento, vendasMP, vendasGN, 
                   faturamento, relacionamento, etica, pontualidade, iniciativa, organizacao, precificacao, reposicao, sinalizacao, proatividade,
                   media, pontosFortes, pontosMelhoria) {
    
    // Cria o nome do arquivo PDF (substituindo espaços por pontos)
    const nomeArquivo = nome.replace(/\s+/g, '.') + '.pdf';
    
    // Cria um novo documento PDF
    const doc = new jsPDF();
    
    // Variáveis para controle de posicionamento
    let yPosition = 20; // Posição Y inicial
    const lineHeight = 10; // Altura entre linhas
    const pageHeight = 280; // Altura útil da página
    const margin = 15; // Margem lateral
    
    // Função para verificar se precisa de nova página
    function checkNewPage(nextLines = 1) {
      if (yPosition + (nextLines * lineHeight) > pageHeight) {
        doc.addPage();
        yPosition = 20;
      }
    }
    
    // Função para adicionar texto com controle de posição
    function addText(text, fontSize = 12, isBold = false, align = 'left') {
      checkNewPage();
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }
      
      if (align === 'center') {
        doc.text(text, 105, yPosition, { align: 'center' });
      } else {
        doc.text(text, margin, yPosition);
      }
      yPosition += lineHeight;
    }
    
    // Função para adicionar texto longo com quebra de linha
    function addLongText(text, fontSize = 12) {
      if (!text || text.trim() === '') return;
      
      doc.setFontSize(fontSize);
      doc.setFont(undefined, 'normal');
      const splitText = doc.splitTextToSize(text, 180);
      
      checkNewPage(splitText.length);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * lineHeight;
    }
    
    // Título principal
    doc.setTextColor(0, 0, 128); // Azul escuro
    addText('Feedback Individual - Pague Menos', 18, true, 'center');
    yPosition += 10; // Espaço extra após título
    
    // Seção: Dados do Funcionário
    doc.setTextColor(0, 0, 0); // Preto
    addText('DADOS DO FUNCIONÁRIO', 14, true);
    yPosition += 5;
    
    addText(`Nome: ${nome}`, 12);
    addText(`Cargo: ${cargo}`, 12);
    addText(`Matrícula: ${matricula}`, 12);
    addText(`Data de Avaliação: ${data}`, 12);
    yPosition += 10; // Espaço entre seções
    
    // Seção: Avaliações
    addText('AVALIAÇÕES INDIVIDUAIS', 14, true);
    yPosition += 5;
    
    addText(`Atendimento ao Cliente: ${atendimento}/10`, 12);
    addText(`Vendas MP: ${vendasMP}/10`, 12);
    addText(`Vendas GN/S: ${vendasGN}/10`, 12);
    addText(`Faturamento: ${faturamento}/10`, 12);
    addText(`Relacionamento Interno: ${relacionamento}/10`, 12);
    addText(`Ética Profissional: ${etica}/10`, 12);
    addText(`Pontualidade: ${pontualidade}/10`, 12);
    addText(`Iniciativa para Aprender: ${iniciativa}/10`, 12);
    addText(`Organização das Prateleiras: ${organizacao}/10`, 12);
    addText(`Precificação: ${precificacao}/10`, 12);
    addText(`Reposição de Produtos: ${reposicao}/10`, 12);
    addText(`Sinalização com Promoções: ${sinalizacao}/10`, 12);
    addText(`Proatividade/Produtividade: ${proatividade}/10`, 12);
    yPosition += 10;
    
    // Nota Média
    addText(`NOTA MÉDIA FINAL: ${media}/10`, 14, true);
    yPosition += 15;
    
    // Pontos Fortes
    if (pontosFortes && pontosFortes.trim() !== '') {
      addText('PONTOS FORTES', 14, true);
      yPosition += 5;
      addLongText(pontosFortes, 12);
      yPosition += 10;
    }
    
    // Pontos de Melhoria
    if (pontosMelhoria && pontosMelhoria.trim() !== '') {
      addText('PONTOS DE MELHORIA', 14, true);
      yPosition += 5;
      addLongText(pontosMelhoria, 12);
    }
    
    // Salva o PDF
    doc.save(nomeArquivo);
  }