export const formatDate = (dateObj: Date) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "long", // Options: 'short', 'medium', 'long', 'full'
  }).format(dateObj);
