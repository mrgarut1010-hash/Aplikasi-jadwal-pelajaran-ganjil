 ============================================================
 APLIKASI JADWAL MENGAJAR - SMPN UNGGULAN SINDANG
 SEMESTER GANJIL 20262027
 ============================================================

function doGet() {
  function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Jadwal Mengajar')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}

 === VALIDASI KODE AKSES (Membaca Kolom A di sheet AKSES_KODE) ===
function VALIDASI_KODE_AKSES(inputCode) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(AKSES_KODE);
    if (!sheet) return false;
    
    var lastRow = sheet.getLastRow();
    if (lastRow  2) return false;
    
     Ambil data dari kolom A (indeks 0)
    var dataKode = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var normalizedInput = inputCode.toString().trim().toUpperCase();
    
    for (var i = 0; i  dataKode.length; i++) {
      var kodeDiSheet = dataKode[i][0].toString().trim().toUpperCase();
      if (kodeDiSheet === normalizedInput) {
        Logger.log(Kode valid  + normalizedInput);
        return true;
      }
    }
    Logger.log(Kode tidak valid  + normalizedInput);
    return false;
  } catch (e) {
    Logger.log(Error validasi  + e.toString());
    return false;
  }
}

 === DAFTAR GURU ===
function getListGuru() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_GURU);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var listGuru = [];
    for (var i = 1; i  data.length; i++) {
      if (data[i][1] && data[i][1].toString().trim() !== ) {
        listGuru.push({
          kode data[i][0],
          nama data[i][1].toString().trim(),
          mapel data[i][2]  data[i][2].toString().trim()  
        });
      }
    }
    return listGuru;
  } catch (e) {
    Logger.log(Error getListGuru  + e.toString());
    return [];
  }
}

 === DAFTAR KELAS ===
function getListKelas() {
  var kelasList = [];
  var tingkat = [VII, VIII, IX];
  var section = [A, B, C, D, E, F, G, H, I, J];
  for (var t = 0; t  tingkat.length; t++) {
    for (var s = 0; s  section.length; s++) {
      kelasList.push(tingkat[t] +   + section[s]);
    }
  }
  return kelasList;
}

 === MAPPING KOLOM & WAKTU ===
function getKolomHari() {
  return {
    SENIN  {02,  13,  24,  35,  47,  58,  610, 711, 812},
    SELASA {013, 114, 215, 316, 418, 519, 621, 722, 823},
    RABU   {024, 125, 226, 327, 429, 530, 632, 733, 834},
    KAMIS  {035, 136, 237, 338, 440, 541, 643, 744, 845},
    JUMAT  {046, 147, 249, 350, 451, 552, 653}
  };
}
function getWaktuJam() {
  return {
    0 06.30 - 07.25,
    1 07.35 - 08.15, 2 08.15 - 08.55, 3 08.55 - 09.35, 4 10.05 - 10.45,
    5 10.45 - 11.25, 6 12.15 - 12.55, 7 12.55 - 13.35, 8 13.35 - 14.15
  };
}
function getWaktuJamJumat() {
  return {
    0 06.30 - 08.00,
    1 08.05 - 08.45, 2 09.10 - 09.50, 3 09.50 - 10.30, 4 10.30 - 11.10,
    5 11.10 - 11.40, 6 11.40 - 12.30
  };
}

 === JADWAL GURU ===
function getJadwalGuru(namaGuru) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetData = ss.getSheetByName(DATA_GURU);
    var sheetMaster = ss.getSheetByName(MASTER_JADWAL);
    if (!sheetData  !sheetMaster) return [];
    
    var dataGuru = sheetData.getDataRange().getValues();
    var kodeGuru = -1;
    var mapelGuru = Mata Pelajaran;
    
    for (var i = 1; i  dataGuru.length; i++) {
      var namaDiSheet = dataGuru[i][1]  dataGuru[i][1].toString().trim()  ;
      if (namaDiSheet.toLowerCase() === namaGuru.toLowerCase()) {
        kodeGuru = dataGuru[i][0];
        mapelGuru = dataGuru[i][2]  dataGuru[i][2].toString().trim()  Mata Pelajaran;
        break;
      }
    }
    if (kodeGuru == -1) return [];
    
    var dataMaster = sheetMaster.getDataRange().getValues();
    var hasil = [];
    var kolomHari = getKolomHari();
    var waktuJam = getWaktuJam();
    var waktuJumat = getWaktuJamJumat();
    var urutanHari = [SENIN, SELASA, RABU, KAMIS, JUMAT];
    
    for (var h = 0; h  urutanHari.length; h++) {
      var hari = urutanHari[h];
      var hariIndex = h + 1;
      var waktuRef = (hari === JUMAT)  waktuJumat  waktuJam;
      
      for (var jam = 1; jam = 8; jam++) {
        var colIdx = kolomHari[hari][jam];
        if (colIdx === undefined) continue;
        
        for (var r = 2; r  dataMaster.length; r++) {
          var kelas = dataMaster[r][1];
          if (!kelas  kelas.toString().trim() === ) continue;
          
          var nilai = dataMaster[r][colIdx];
          if (nilai !== null && nilai !==  && !isNaN(Number(nilai))) {
            if (Number(nilai) === Number(kodeGuru)) {
              hasil.push({
                hariIndex hariIndex, hari hari, jam jam,
                waktu waktuRef[jam.toString()]  -,
                mapel mapelGuru, kelas kelas.toString().trim()
              });
            }
          }
        }
      }
    }
    hasil.sort(function(a, b) {
      if (a.hariIndex !== b.hariIndex) return a.hariIndex - b.hariIndex;
      return a.jam - b.jam;
    });
    return hasil;
  } catch (e) {
    Logger.log(Error getJadwalGuru  + e.toString());
    return [];
  }
}

 === JADWAL KELAS ===
function getJadwalKelas(namaKelas) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetData = ss.getSheetByName(DATA_GURU);
    var sheetMaster = ss.getSheetByName(MASTER_JADWAL);
    if (!sheetData  !sheetMaster) return null;
    
    var dataGuru = sheetData.getDataRange().getValues();
    var mapGuru = {};
    for (var i = 1; i  dataGuru.length; i++) {
      var kode = dataGuru[i][0];
      var nama = dataGuru[i][1];
      var mapel = dataGuru[i][2];
      if (kode !== null && kode !==  && nama) {
        mapGuru[Number(kode)] = { nama nama.toString().trim(), mapel mapel  mapel.toString().trim()   };
      }
    }
    
    var dataMaster = sheetMaster.getDataRange().getValues();
    var barisKelas = -1;
    for (var r = 2; r  dataMaster.length; r++) {
      var kelasDiSheet = dataMaster[r][1];
      if (kelasDiSheet && kelasDiSheet.toString().trim() === namaKelas) {
        barisKelas = r; break;
      }
    }
    if (barisKelas == -1) return null;
    
    var kolomHari = getKolomHari();
    var waktuJam = getWaktuJam();
    var waktuJumat = getWaktuJamJumat();
    var urutanHari = [SENIN, SELASA, RABU, KAMIS, JUMAT];
    var jadwal = {};
    
    for (var h = 0; h  urutanHari.length; h++) {
      var hari = urutanHari[h];
      jadwal[hari] = [];
      var waktuRef = (hari === JUMAT)  waktuJumat  waktuJam;
      
      for (var jam = 1; jam = 8; jam++) {
        var colIdx = kolomHari[hari][jam];
        if (colIdx === undefined) continue;
        
        var nilai = dataMaster[barisKelas][colIdx];
        var infoGuru = null;
        if (nilai !== null && nilai !==  && !isNaN(Number(nilai))) {
          infoGuru = mapGuru[Number(nilai)]  null;
        }
        
        jadwal[hari].push({
          jam jam, waktu waktuRef[jam.toString()]  -,
          guru infoGuru  infoGuru.nama  ,
          mapel infoGuru  infoGuru.mapel  , kode nilai
        });
      }
    }
    return {kelas namaKelas, jadwal jadwal};
  } catch (e) {
    Logger.log(Error getJadwalKelas  + e.toString());
    return null;
  }
}

 === GURU PIKET ===
function getGuruPiket() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MASTER_JADWAL);
    if (!sheet) return {SENIN, SELASA, RABU, KAMIS, JUMAT};
    
    var data = sheet.getDataRange().getValues();
    var hasil = {SENIN, SELASA, RABU, KAMIS, JUMAT};
    var blocks = {SENIN[2,12], SELASA[13,23], RABU[24,34], KAMIS[35,45], JUMAT[46,53]};
    
    for (var r = 0; r  data.length; r++) {
      var c0 = String(data[r][0]  ).toUpperCase();
      var c1 = String(data[r][1]  ).toUpperCase();
      if (c0.indexOf(PATROLLING) !== -1  c1.indexOf(PATROLLING) !== -1) {
        for (var hari in blocks) {
          for (var c = blocks[hari][0]; c = blocks[hari][1]; c++) {
            var v = data[r][c];
            if (v && String(v).trim() !== ) { 
              hasil[hari] = String(v).replace(s+g, ' ').trim(); 
              break; 
            }
          }
        }
        break;
      }
    }
    return hasil;
  } catch (e) {
    Logger.log(Error getGuruPiket  + e.toString());
    return {SENIN, SELASA, RABU, KAMIS, JUMAT};
  }
}