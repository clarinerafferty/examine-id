export function resolveCategoryIcon(categoryName, fallbackIconKey = "house") {
  const normalizedName = String(categoryName || "").toLowerCase();

  if (normalizedName.includes("travel") || normalizedName.includes("accommodation")) {
    return { iconKey: "plane", iconLabel: "Travel and Accommodation" };
  }

  if (normalizedName.includes("housing")) {
    return { iconKey: "house", iconLabel: "Housing" };
  }

  if (normalizedName.includes("digital") || normalizedName.includes("communication")) {
    return { iconKey: "smartphone", iconLabel: "Digital Communications" };
  }

  if (normalizedName.includes("community") || normalizedName.includes("outreach")) {
    return { iconKey: "users", iconLabel: "Community Outreach" };
  }

  if (normalizedName.includes("constituency") || normalizedName.includes("office")) {
    return { iconKey: "building-2", iconLabel: "Constituency Office Operations" };
  }

  if (
    normalizedName.includes("staff") ||
    normalizedName.includes("research") ||
    normalizedName.includes("support")
  ) {
    return { iconKey: "shield-user", iconLabel: "Staff and Research Support" };
  }

  return {
    iconKey: fallbackIconKey || "house",
    iconLabel: categoryName || "Category",
  };
}
