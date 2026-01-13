import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FilterCheatsheetProps {
  type: "projects" | "teams";
}

export function FilterCheatsheet({ type }: FilterCheatsheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (type === "projects") {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          Filter Syntax Guide
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardHeader>
              <CardTitle className="text-lg">Projects Filter Syntax</CardTitle>
              <CardDescription>Use natural language to filter projects across multiple fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Basic Filtering</h4>
                <ul className="space-y-1 ml-4">
                  <li>• <code className="bg-gray-100 px-1 rounded">hospital</code> - Matches any field containing "hospital"</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">2024</code> - Finds projects from year 2024</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">USA</code> - Matches country or location</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Field-Specific Filtering</h4>
                <ul className="space-y-1 ml-4">
                  <li>• <code className="bg-gray-100 px-1 rounded">entity:hospital</code> - Entity contains "hospital"</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">client:government</code> - Client contains "government"</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">location:london</code> - Location contains "london"</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">country:UK</code> - Country is UK</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">year:2024</code> - Project year is 2024</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">services:design</code> - Services include "design"</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">value:{'>'} 1000000</code> - Value greater than 1M</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Logic Operations</h4>
                <ul className="space-y-1 ml-4">
                  <li>• <code className="bg-gray-100 px-1 rounded">hospital AND 2024</code> - Both conditions must match</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">UK OR USA</code> - Either condition matches</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">NOT commercial</code> - Exclude projects with "commercial"</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">entity:hospital AND year:2024</code> - Combined field filters</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Comparison Operators</h4>
                <ul className="space-y-1 ml-4">
                <li>• <code className="bg-gray-100 px-1 rounded">value:{'>'} 500000</code> - Greater than</li>
                <li>• <code className="bg-gray-100 px-1 rounded">value:{'<'}2000000</code> - Less than</li>
                <li>• <code className="bg-gray-100 px-1 rounded">year:{'>'}=2023</code> - Greater than or equal</li>
                <li>• <code className="bg-gray-100 px-1 rounded">year:{'<'}=2024</code> - Less than or equal</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Complex Examples</h4>
                <ul className="space-y-1 ml-4">
                  <li>• <code className="bg-gray-100 px-1 rounded">entity:hospital AND country:UK AND year:2024</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">(UK OR USA) AND services:architecture</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">value:{'>'} 1000000 AND NOT commercial</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">client:government OR client:healthcare</code></li>
                </ul>
              </div>

              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-blue-800">
                  <strong>Tip:</strong> Filters are case-insensitive and search across all text fields by default. 
                  Use field-specific syntax for precise matching.
                </p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Teams filter cheatsheet
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        Filter Syntax Guide
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2">
          <CardHeader>
            <CardTitle className="text-lg">Team Filter Syntax</CardTitle>
            <CardDescription>Use natural language to filter team members across multiple fields</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Basic Filtering</h4>
              <ul className="space-y-1 ml-4">
                <li>• <code className="bg-gray-100 px-1 rounded">john</code> - Matches name, title, skills, or bio</li>
                <li>• <code className="bg-gray-100 px-1 rounded">architect</code> - Finds architects by title or skills</li>
                <li>• <code className="bg-gray-100 px-1 rounded">design</code> - Matches skills or bio keywords</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Field-Specific Filtering</h4>
              <ul className="space-y-1 ml-4">
                <li>• <code className="bg-gray-100 px-1 rounded">name:smith</code> - Name contains "smith"</li>
                <li>• <code className="bg-gray-100 px-1 rounded">title:director</code> - Title contains "director"</li>
                <li>• <code className="bg-gray-100 px-1 rounded">skills:revit</code> - Skills include "revit"</li>
                <li>• <code className="bg-gray-100 px-1 rounded">bio:healthcare</code> - Bio mentions "healthcare"</li>
                <li>• <code className="bg-gray-100 px-1 rounded">experience:{'>'} 10</code> - More than 10 years experience</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Logic Operations</h4>
              <ul className="space-y-1 ml-4">
                <li>• <code className="bg-gray-100 px-1 rounded">architect AND revit</code> - Both conditions must match</li>
                <li>• <code className="bg-gray-100 px-1 rounded">director OR manager</code> - Either condition matches</li>
                <li>• <code className="bg-gray-100 px-1 rounded">NOT junior</code> - Exclude members with "junior"</li>
                <li>• <code className="bg-gray-100 px-1 rounded">title:architect AND skills:bim</code> - Combined field filters</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Experience Filtering</h4>
              <ul className="space-y-1 ml-4">
                <li>• <code className="bg-gray-100 px-1 rounded">experience:{'>'} 15</code> - More than 15 years</li>
                <li>• <code className="bg-gray-100 px-1 rounded">experience:{'<'}5</code> - Less than 5 years</li>
                <li>• <code className="bg-gray-100 px-1 rounded">experience:{'>'}=10</code> - 10 or more years</li>
                <li>• <code className="bg-gray-100 px-1 rounded">experience:5-10</code> - Between 5 and 10 years</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Complex Examples</h4>
              <ul className="space-y-1 ml-4">
                <li>• <code className="bg-gray-100 px-1 rounded">title:architect AND experience:{'>'} 10 AND skills:revit</code></li>
                <li>• <code className="bg-gray-100 px-1 rounded">(director OR manager) AND experience:{'>'} 15</code></li>
                <li>• <code className="bg-gray-100 px-1 rounded">skills:bim AND bio:healthcare AND NOT junior</code></li>
                <li>• <code className="bg-gray-100 px-1 rounded">name:smith OR name:jones</code></li>
              </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-blue-800">
                <strong>Tip:</strong> Filters are case-insensitive. Use quotes for exact phrases: 
                <code className="bg-white px-1 rounded mx-1">"senior architect"</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
