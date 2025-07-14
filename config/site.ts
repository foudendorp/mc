export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Microsoft 365 Message Center Archive",
  description:
    "Archive of messages posted in the Message Center of the Microsoft 365 Admin Portal.",
  url: "https://mc.oudendorp.it", // Add the site URL
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "GetCurrent",
      href: "https://getcurrent.cloud",
    },
    {
      title: "SecMinds",
      href: "https://secminds.nl",
    },
  ],
  links: {
    linkedin: "https://www.linkedin.com/company/secminds-solutions/",
    github: "https://github.com/foudendorp/mc",
  },
}
