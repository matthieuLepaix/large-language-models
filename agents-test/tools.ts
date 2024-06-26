import { z } from "zod";
import { DynamicStructuredTool } from "langchain/tools";

import { getGeoBoundsFromCityName } from "./geo";

const addTool = new DynamicStructuredTool({
  name: "add",
  description: "Add two integers together.",
  schema: z.object({
    firstInt: z.number(),
    secondInt: z.number(),
  }),
  func: async ({ firstInt, secondInt }) => {
    return (firstInt + secondInt).toString();
  },
});

const multiplyTool = new DynamicStructuredTool({
  name: "multiply",
  description: "Multiply two integers together.",
  schema: z.object({
    firstInt: z.number(),
    secondInt: z.number(),
  }),
  func: async ({ firstInt, secondInt }) => {
    return (firstInt * secondInt).toString();
  },
});

const exponentiateTool = new DynamicStructuredTool({
  name: "exponentiate",
  description: "Exponentiate the base to the exponent power.",
  schema: z.object({
    base: z.number(),
    exponent: z.number(),
  }),
  func: async ({ base, exponent }) => {
    return (base ** exponent).toString();
  },
});

const CAPACITY_FILTERS = [[1, 4], [5, 9], [10, 19], [20]];

const meetingRoomsAvailabilityTool = new DynamicStructuredTool({
  name: "meeting_rooms_availability",
  description: "Check the availability of meeting rooms.",
  schema: z.object({
    localStartDateTime: z.string().optional(),
    localEndDateTime: z.string().optional(),
    numberOfPeople: z.number().optional(),
    city: z.string().optional(),
  }),
  func: async ({
    localStartDateTime,
    localEndDateTime,
    city,
    numberOfPeople,
  }) => {
    if (city == null) {
      return "Please provide a city.";
    }

    if (localStartDateTime == null) {
      return "Please provide a start date and time.";
    }

    if (localEndDateTime == null) {
      return "Please provide an end date and time.";
    }

    if (numberOfPeople == null || numberOfPeople <= 0) {
      return "Please provide the positive number of people.";
    }

    const startDate = new Date(localStartDateTime);
    const endDate = new Date(localEndDateTime);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "Please provide a valid date and time.";
    }

    const capacityFilter = CAPACITY_FILTERS.find(
      (capacity) => capacity[1] == null || capacity[1] >= numberOfPeople
    );

    const result = await fetch(
      `${process.env.INDUSTRIOUS_API_URL}/inventory/v1.1.0/discovery/meeting-rooms/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seats: [
            {
              min: capacityFilter[0],
              max: capacityFilter[1],
            },
          ],
          dateRange: {
            localStartDate: localStartDateTime,
            localEndDate: localEndDateTime,
          },
          within: getGeoBoundsFromCityName(city),
        }),
      }
    );

    if (!result.ok) {
      return (
        "There was an error fetching the data." +
        JSON.stringify(await result.json())
      );
    }

    const jsonResult = (await result.json()) as Array<{
      slug: string;
      name: string;
      seats: number;
    }>;

    const matchingRooms = jsonResult.filter((mr) => mr.seats >= numberOfPeople);

    if (matchingRooms.length === 0) {
      return `No meeting rooms available in ${city} for ${numberOfPeople} people.`;
    }

    return `The best meeting rooms available for you in ${city} for ${numberOfPeople} people are: ${matchingRooms
      .sort((a, b) => a.seats - b.seats)
      .map(
        (mr) =>
          `${mr.name}: ${process.env.INDUSTRIOUS_WEBSITE_URL}/meeting-rooms/${
            mr.slug
          }/reserve/summary?startDate=${encodeURIComponent(
            localStartDateTime
          )}&endDate=${encodeURIComponent(localEndDateTime)}`
      )
      .slice(0, 3)
      .join(", ")}`;
  },
});

export {
  addTool,
  multiplyTool,
  exponentiateTool,
  meetingRoomsAvailabilityTool,
};
