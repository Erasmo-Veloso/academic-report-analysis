import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ProjectEntry } from "@/lib/project-data";

interface ProjectCardProps {
  project: ProjectEntry;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="border-border/50 w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base md:text-lg leading-snug">
              {project.titlePt}
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium">
              {project.titleEn}
            </p>
          </div>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver projeto ao vivo"
            className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {project.descriptionPt}
        </p>
        <p className="text-xs text-muted-foreground/70 leading-relaxed italic">
          {project.descriptionEn}
        </p>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-1.5 pt-0">
        {project.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
}
