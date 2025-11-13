import React from 'react';

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a4 4 0 00-4-4h4a4 4 0 004-4v-1.172a2 2 0 00-2-2h-2.172a2 2 0 01-1.414-.586l-.828-.828A2 2 0 009.172 6H7a2 2 0 00-2 2v1.172a2 2 0 00.586 1.414l.828.828a2 2 0 01.586 1.414V14a4 4 0 004 4z" />
    </svg>
);

export default UsersIcon;
