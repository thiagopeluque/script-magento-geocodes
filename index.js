const ExcelJS = require('exceljs');
const fs = require('fs');

// Mapeando as siglas com os estados
const ufToRegion = {
  'SP': 'São Paulo',
  'MG': 'Minas Gerais',
  'ES': 'Espírito Santo',
  'RJ': 'Rio de Janeiro',
  'PR': 'Paraná',
  'SC': 'Santa Catarina',
  'RS': 'Rio Grande do Sul',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'GO': 'Goiás',
  'DF': 'Distrito Federal',
  'PE': 'Pernambuco',
  'CE': 'Ceará',
  'RN': 'Rio Grande do Norte',
  'AL': 'Alagoas',
  'SE': 'Sergipe',
  'BA': 'Bahia',
  'PB': 'Paraiba',
  'PA': 'Paraú',
  'AM': 'Amazonas',
  'RO': 'Rondoônia',
  'AC': 'Acre',
  'AP': 'Amapá',
  'RR': 'Roraima',
  'MA': 'Maranhão',
  'PI': 'Piaú',
  'TO': 'Tocantins',
};

// Mudar o formato do CEP colocando o '-'
const formatPostcode = (cep) => {
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
};

// Verificar se os dados estão corretos ou são nulos ou vazios
const validateLatLong = (data) => {
  if (data && typeof data === 'string' && data.length > 1) {
    return data;
  }
  return null;
};

// SQL Insert
let sql = 'INSERT INTO inventory_geoname (country_code, postcode, city, region, province, latitude, longitude, source_code, entity_id) VALUES\n';

let entityId = 0;

// Cria uma instância do workbook e abre o arquivo em modo de leitura de stream
const workbook = new ExcelJS.stream.xlsx.WorkbookReader();

workbook.on('worksheet', (worksheet) => {
  worksheet.on('row', (row) => {
    if (row.number > 1) { // Ignora a primeira linha (cabeçalhos)
      const cep = row.getCell(1).value.toString();
      const cidadeAcento = row.getCell(11).value;
      const cidadeOficial = row.getCell(10).value;
      const uf = row.getCell(3).value;
      const codMun = row.getCell(12).value;
      const latitude = validateLatLong(row.getCell(19).value);
      const longitude = validateLatLong(row.getCell(20).value);
      const city = cidadeAcento || cidadeOficial;
      const region = ufToRegion[uf] || uf;
      const province = codMun;
      if (latitude != null && longitude != null) {
        sql += `('BR', '${formatPostcode(cep)}','${city}','${region}','${province}',${latitude},${longitude},'',${entityId}),\n`;
        entityId += 3;
      }
    }
  });

  worksheet.on('finished', () => {
    // Remove a última vírgula e adiciona o ponto e vírgula final
    sql = sql.slice(0, -2) + ';\n';

    // Escreve o arquivo SQL
    fs.writeFileSync('ceps.sql', sql);
    console.log('Arquivo SQL gerado com Sucesso!');
  });
});

// Inicia a leitura do arquivo em stream
workbook.read(fs.createReadStream('basecep_integrada_exemplo.xlsx'));