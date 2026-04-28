function parseJsonText(text) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("data.json must be an array");
  return parsed;
}

function loadViaXHR(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
          resolve(parseJsonText(xhr.responseText));
        } else {
          reject(new Error(`XHR failed: ${xhr.status}`));
        }
      }
    };
    xhr.onerror = reject;
    xhr.send();
  });
}

export async function loadData(url = "./data/data.json") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    return parseJsonText(await res.text());
  } catch (err) {
    return loadViaXHR(url);
  }
}
