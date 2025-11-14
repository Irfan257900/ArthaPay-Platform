export const groupMenuLinks = (data) => {
  const enabledModules = [];
  if (!data) return { menuLinks: [], enabledModules };
  const itemsById = new Map();
  const menuLinksMap = new Map();
  data.forEach((item) => {
    itemsById.set(item.id, item);
  });
  data.forEach((link) => {
    if (!link.isEnabled) return;

    const { id, parentId, screenName } = link;

    if (parentId) {
      const parent = itemsById.get(parentId);
      if (!parent?.isEnabled) return;

      const parentEntry = menuLinksMap.get(parentId) || {
        ...parent,
        children: [],
      };
      parentEntry.hasSubMenu = true;
      parentEntry.children.push(link);
      menuLinksMap.set(parentId, parentEntry);
    } else {
      menuLinksMap.set(id, { ...link, children: [], hasSubMenu: false });
      enabledModules.push(screenName);
    }
  });
  return { menuLinks: Array.from(menuLinksMap.values()), enabledModules };
};

export const findMatchingMenu = (menuLinks, pathname) => {
  for (const menu of menuLinks) {
    if (
      (menu.path && pathname.startsWith(`${menu.path}`)) ||
      (!menu.path &&
        menu.featureName &&
        pathname.startsWith(`/${menu.featureName.toLowerCase()}`))
    ) {
      return menu;
    }
  }
};
export const exceptPaths = [
  "/dashboard",
  "/vaults",
  "/cards",
  "/payments",
  "/transactions",
  "/notifications",
  "/transactions/vaults",
  "/transactions/payments",
  "/transactions/cards",
  "/payees",
  "/settings/team",
  "/referrals",
];
