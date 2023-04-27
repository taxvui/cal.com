import { CallToAction, CallToActionTable } from "../components";
import { OrganizerScheduledEmail } from "./OrganizerScheduledEmail";

export const AttendeeWasRequestedToRescheduleEmail = (
  props: { metadata: { rescheduleLink: string } } & React.ComponentProps<typeof OrganizerScheduledEmail>
) => (
  <OrganizerScheduledEmail
    title="request_reschedule_booking"
    subtitle={
      <>
        {props.calEvent.organizer.language.translate("request_reschedule_subtitle", {
          organizer: props.calEvent.organizer.name,
        })}
      </>
    }
    headerType="calendarCircle"
    subject="rescheduled_event_type_subject"
    callToAction={
      <CallToActionTable>
        <CallToAction label="Book a new time" href={props.metadata.rescheduleLink} endIconName="linkIcon" />
      </CallToActionTable>
    }
    {...props}
  />
);
