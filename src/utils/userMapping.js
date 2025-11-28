// Helper: set obj["a"]["b"]["c"] = value, given "a.b.c"
function setNested(obj, path, value) {
  const parts = path.split(".");
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!curr[key] || typeof curr[key] !== "object") {
      curr[key] = {};
    }
    curr = curr[key];
  }
  curr[parts[parts.length - 1]] = value;
}

// Build nested object from headers + row values
function buildObjectFromRow(headers, values) {
  const root = {};
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i];
    const value = values[i] ?? null;

    if (!key) continue;                      // skip empty header
    if (value === null || value === "") continue; // skip empty value

    setNested(root, key, value);
  }
  return root;
}

// Convert nested object into DB record: { name, age, address, additional_info }
function toUserRecord(nestedObj) {
  const firstName = nestedObj?.name?.firstName || "";
  const lastName = nestedObj?.name?.lastName || "";
  const ageRaw = nestedObj?.age;
  const age = Number(ageRaw);

  if (Number.isNaN(age)) {
    throw new Error(`Invalid age: ${ageRaw}`);
  }

  const name = `${firstName} ${lastName}`.trim();

  // address.* goes into address
  const address = nestedObj.address || null;

  // Everything else (except name.*, age, address.*) goes into additional_info
  const additional_info = {};

  function walk(obj, pathPrefix = []) {
    for (const [key, value] of Object.entries(obj)) {
      const path = [...pathPrefix, key];
      const fullKey = path.join(".");

      const isNameFirst = fullKey === "name.firstName";
      const isNameLast = fullKey === "name.lastName";
      const isAge = fullKey === "age";
      const isAddress = fullKey.startsWith("address.");

      // Skip fields that go to name/age/address
      if (isNameFirst || isNameLast || isAge || isAddress) {
        if (typeof value === "object" && value !== null) {
          walk(value, path);
        }
        continue;
      }

      if (typeof value === "object" && value !== null) {
        // still nested, go deeper
        walk(value, path);
      } else {
        // Put this into additional_info, preserving nesting
        let curr = additional_info;
        for (let i = 0; i < path.length - 1; i++) {
          const k = path[i];
          if (!curr[k] || typeof curr[k] !== "object") {
            curr[k] = {};
          }
          curr = curr[k];
        }
        curr[path[path.length - 1]] = value;
      }
    }
  }

  walk(nestedObj);

  return {
    name,
    age,
    address,
    additional_info: Object.keys(additional_info).length
      ? additional_info
      : null,
  };
}

module.exports = { buildObjectFromRow, toUserRecord };
