interface PageHeaderProps {
    title: string;
    description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                {title}
            </h1>
            <p className="text-sm text-gray-400 font-medium max-w-2xl">
                {description}
            </p>
        </div>
    );
}
