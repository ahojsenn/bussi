import Papa from 'papaparse'


export const getDataFromGoogle = (url: string): Promise<any> => {
  let seenHeaders = new Set()

  const ret = new Promise(function (resolve, reject) {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: 'greedy',

      transformHeader: (header) => {
        const trimmedHeader = header.replace(/[\r\n]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        seenHeaders.add(trimmedHeader);
        return trimmedHeader;
      },
      beforeFirstChunk: () => {
        seenHeaders.clear(); // Wichtig: Vor jedem neuen Fetch den Cache leeren!
      },
      complete: resolve,
      error: reject,
    });
  });
  //logd("hauptbuch.getDataFromGoogle: ", ret)
  return ret;
};
