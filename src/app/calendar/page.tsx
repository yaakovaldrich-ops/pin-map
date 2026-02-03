import Calendar from "@/components/Calendar";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Event Calendar - Pin Map",
  description: "View and add upcoming events on the community calendar.",
};

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Calendar />
    </div>
  );
}
