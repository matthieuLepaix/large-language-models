import { z } from "zod";
import { DynamicStructuredTool } from "langchain/tools";

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

const NEW_YORK_GEO_SEARCH = {
  northEastPoint: {
    longitude: -71.3416988598131,
    latitude: 45.10740785825482,
  },
  southWestPoint: {
    longitude: -80.22661564018898,
    latitude: 40.3557236305478,
  },
};

const CAPACITY_FILTERS = [[1, 4], [5, 9], [10, 19], [20]];

const meetingRoomsAvailabilityTool = new DynamicStructuredTool({
  name: "meeting_rooms_availability",
  description: "Check the availability of meeting rooms.",
  schema: z.object({
    localStartDateTime: z.string(),
    localEndDateTime: z.string(),
    numberOfPeople: z.number(),
    city: z.string(),
  }),
  func: async ({
    localStartDateTime,
    localEndDateTime,
    city,
    numberOfPeople,
  }) => {
    if (city !== "New York") {
      return "No meeting available in this city.";
    }

    const capacityFilter = CAPACITY_FILTERS.find(
      (capacity) =>
        capacity[0] <= numberOfPeople &&
        (!capacity[1] || capacity[1] >= numberOfPeople)
    );

    const result = await fetch(
      "https://api-gateway-dev0.industriousofficedev.com/inventory/v1.1.0/discovery/meeting-rooms/search",
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
          within: {
            northEastPoint: {
              longitude: -71.3416988598131,
              latitude: 45.10740785825482,
            },
            southWestPoint: {
              longitude: -80.22661564018898,
              latitude: 40.3557236305478,
            },
          },
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
    }>;

    if (jsonResult.length === 0) {
      return `No meeting rooms available in New York for ${numberOfPeople} people.`;
    }

    return `The meeting rooms available in New York for ${numberOfPeople} people are: ${jsonResult
      .map(
        (mr) =>
          `${mr.name}: https://www-dev0.industriousofficedev.com/meeting-rooms/${mr.slug}`
      )
      .join(", ")}`;
  },
});

export {
  addTool,
  multiplyTool,
  exponentiateTool,
  meetingRoomsAvailabilityTool,
};
