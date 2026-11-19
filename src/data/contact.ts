export const contact = {
  email: "fathiaolajumoke22@gmail.com",
  phoneDisplay: "+234 813 366 6980",
  phoneHref: "+2348133666980",
};

export function contactEmailUrl(subject: string) {
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;
}